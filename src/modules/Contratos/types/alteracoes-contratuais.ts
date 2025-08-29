// Tipos que mapeiam para os IDs da API (conforme documentação EGC-174)
export const TipoAlteracao = {
  AditivoPrazo: 1,
  Valor: 2,  
  AditivoQualitativo: 3,
  AditivoQuantidade: 4,
  PrazoEValor: 5,
  SubRogacao: 6,
  Reajuste: 7,
  Repactuacao: 8,
  Reequilibrio: 9,
  RepactuacaoEReequilibrio: 10,
  Rescisao: 11,
  Supressao: 12,
  Suspensao: 13,
  Apostilamento: 14
} as const

export type TipoAlteracao = typeof TipoAlteracao[keyof typeof TipoAlteracao]

// Operações de valor
export const OperacaoValor = {
  Acrescentar: 1,
  Diminuir: 2,
  Substituir: 3
} as const

export type OperacaoValor = typeof OperacaoValor[keyof typeof OperacaoValor]

// Operações de vigência
export const OperacaoVigencia = {
  Acrescentar: 1,
  Diminuir: 2,
  Substituir: 3,
  SuspenderDeterminado: 4,
  SuspenderIndeterminado: 5
} as const

export type OperacaoVigencia = typeof OperacaoVigencia[keyof typeof OperacaoVigencia]

// Tipos de unidade de tempo
export const TipoUnidadeTempo = {
  Dias: 1,
  Meses: 2,
  Anos: 3
} as const

export type TipoUnidadeTempo = typeof TipoUnidadeTempo[keyof typeof TipoUnidadeTempo]

// Status das alterações
export const StatusAlteracao = {
  Rascunho: 1,
  AguardandoAprovacao: 2,
  Vigente: 3,
  Rejeitado: 4
} as const

export type StatusAlteracao = typeof StatusAlteracao[keyof typeof StatusAlteracao]

// Interface para o Bloco Cláusulas
export interface BlocoClausulas {
  clausulasExcluidas?: string
  clausulasIncluidas?: string
  clausulasAlteradas?: string
}

// Interface para o Bloco Vigência
export interface BlocoVigencia {
  operacao: OperacaoVigencia
  valorTempo?: number
  tipoUnidade?: TipoUnidadeTempo
  novaDataFinal?: string
  isIndeterminado?: boolean
  observacoes?: string
}

// Interface para o Bloco Valor
export interface BlocoValor {
  operacao: OperacaoValor
  valorAjuste?: number
  percentualAjuste?: number
  novoValorGlobal?: number
  valorCalculadoAutomaticamente?: boolean
  observacoes?: string
}

// Interface para fornecedor no Bloco Fornecedores
export interface FornecedorAlteracao {
  empresaId: string
  percentualParticipacao?: number
  valorAtribuido?: number
  observacoes?: string
}

// Interface para o Bloco Fornecedores
export interface BlocoFornecedores {
  fornecedoresVinculados?: FornecedorAlteracao[]
  fornecedoresDesvinculados?: string[]
  novoFornecedorPrincipal?: string
  observacoes?: string
}

// Interface para o Bloco Unidades
export interface BlocoUnidades {
  unidadesVinculadas?: string[]
  unidadesDesvinculadas?: string[]
  observacoes?: string
}

// Operações para fornecedores
export const OperacaoFornecedor = {
  Vincular: 1,
  Desvincular: 2,
  Substituir: 3
} as const

export type OperacaoFornecedor = typeof OperacaoFornecedor[keyof typeof OperacaoFornecedor]

// Operações para unidades
export const OperacaoUnidade = {
  Vincular: 1,
  Desvincular: 2,
  Substituir: 3
} as const

export type OperacaoUnidade = typeof OperacaoUnidade[keyof typeof OperacaoUnidade]

// Status de alterações contratuais (mapeamento para API)
export const StatusAlteracaoContratual = {
  Rascunho: 1,
  AguardandoAprovacao: 2,
  Aprovada: 3,
  Rejeitada: 4,
  Ativa: 5,
  Cancelada: 6
} as const

export type StatusAlteracaoContratual = typeof StatusAlteracaoContratual[keyof typeof StatusAlteracaoContratual]

// Interface para dados básicos da alteração
export interface DadosBasicos {
  justificativa: string
  fundamentoLegal?: string
  observacoes?: string
}

// ========== INTERFACES PARA PAYLOAD DA API ==========

// Interface para o payload flat esperado pela API
export interface AlteracaoContratualPayload {
  // Campos obrigatórios
  contratoId: string
  tiposAlteracao: number[]
  justificativa: string
  dataEfeito: string // ISO string: "2024-01-01"
  
  // Campos opcionais básicos
  fundamentoLegal?: string
  observacoes?: string
  
  // Blocos dinâmicos (flat structure)
  // Bloco Valor
  valor?: {
    operacao: number // OperacaoValor  
    valorAjuste?: number
    percentualAjuste?: number
    novoValorGlobal?: number
    valorCalculadoAutomaticamente?: boolean
    observacoes?: string
  }
  
  // Bloco Vigência
  vigencia?: {
    operacao: number // OperacaoVigencia
    valorTempo?: number
    tipoUnidade?: number // TipoUnidadeTempo
    novaDataFinal?: string
    isIndeterminado?: boolean
    observacoes?: string
  }
  
  // Bloco Cláusulas
  clausulas?: {
    clausulasExcluidas?: string
    clausulasIncluidas?: string  
    clausulasAlteradas?: string
  }
  
  // Bloco Fornecedores
  fornecedores?: {
    fornecedoresVinculados?: Array<{
      empresaId: string
      percentualParticipacao?: number
      valorAtribuido?: number
      observacoes?: string
    }>
    fornecedoresDesvinculados?: string[]
    novoFornecedorPrincipal?: string
    observacoes?: string
  }
  
  // Bloco Unidades
  unidades?: {
    unidadesVinculadas?: string[]
    unidadesDesvinculadas?: string[]
    observacoes?: string
  }
}

// Interface para bloco de cláusulas (API)
export interface BlocoClausulasApi {
  clausulasAlteradas: Array<{
    numeroClausula: string
    textoOriginal: string
    textoAlterado: string
    tipoAlteracao: 'substituir' | 'incluir' | 'excluir'
  }>
}

// Interface para bloco de vigência (API)
export interface BlocoVigenciaApi {
  operacao: OperacaoVigencia
  dataInicio?: string
  dataFim?: string
  periodoSuspensao?: {
    dataInicio: string
    dataFim: string
  }
}

// Interface para bloco de valor (API)
export interface BlocoValorApi {
  operacao: OperacaoValor
  valor: number
  percentual?: number
}

// Interface para bloco de fornecedores (API)
export interface BlocoFornecedoresApi {
  operacao: OperacaoFornecedor
  fornecedoresAfetados: Array<{
    id: string
    nome: string
    cnpj: string
  }>
}

// Interface para bloco de unidades (API)
export interface BlocoUnidadesApi {
  operacao: OperacaoUnidade
  unidadesAfetadas: Array<{
    id: string
    nome: string
    codigo: string
  }>
}

// Interface para blocos dinâmicos (API)
// Interface para estrutura de blocos no frontend
export interface BlocosDinamicos {
  clausulas?: BlocoClausulas
  vigencia?: BlocoVigencia  
  valor?: BlocoValor
  fornecedores?: BlocoFornecedores
  unidades?: BlocoUnidades
}

// Interface principal da alteração contratual
export interface AlteracaoContratualForm {
  // Campos obrigatórios
  contratoId: string
  tiposAlteracao: TipoAlteracao[]
  dadosBasicos: DadosBasicos
  dataEfeito: string // Data de efeito da alteração (ISO string)
  blocos: BlocosDinamicos
  
  // Campos de sistema
  id?: string
  versaoContrato?: number
  status?: StatusAlteracao
  requerConfirmacaoLimiteLegal?: boolean
  criadoEm?: string
  atualizadoEm?: string
  criadoPor?: string
}

// Resposta da API para alteração contratual
export interface AlteracaoContratualResponse {
  id: string
  contratoId: string
  tiposAlteracao: TipoAlteracao[]
  dadosBasicos: DadosBasicos
  blocos: BlocosDinamicos
  status: StatusAlteracaoContratual
  criadoEm: string
  atualizadoEm: string
  criadoPor: string
}

// Interface para alerta de limite legal
export interface AlertaLimiteLegal {
  limites: Array<{
    tipo: 'acrescimo' | 'prazo' | 'objeto'
    limiteLegal: number
    valorAtual: number
    severidade: 'alerta' | 'critico'
    observacoes?: string
  }>
  fundamentacaoLegal?: string
}

// Interface para resposta de lista de alterações
export interface AlteracaoContratualListResponse {
  dados: AlteracaoContratualResponse[]
  paginaAtual: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temProximaPagina: boolean
  temPaginaAnterior: boolean
}

// Interface para filtros de alterações contratuais
export interface FiltrosAlteracoesContratuais {
  pagina?: number
  tamanhoPagina?: number
  status?: StatusAlteracaoContratual
  tipoAlteracao?: TipoAlteracao
  dataInicio?: string
  dataFim?: string
  ordenarPor?: 'dataCriacao' | 'dataAtualizacao' | 'status'
  direcaoOrdenacao?: 'asc' | 'desc'
}

// Interface para resumo de alteração (preview da API)
export interface ResumoAlteracaoResponse {
  impactoValor?: {
    valorOriginal: number
    valorAlterado: number
    percentual: number
  }
  impactoPrazo?: {
    prazoOriginal: number
    prazoAlterado: number
    diasAlterados: number
  }
  status: string
  alertaLimiteLegal?: AlertaLimiteLegal
}

// Interface para workflow/status de aprovação
export interface WorkflowStatusResponse {
  id: string
  alteracaoId: string
  status: StatusAlteracaoContratual
  comentarios?: string
  responsavel: {
    id: string
    nome: string
  }
  dataMovimentacao: string
}

// Interface para confirmação de limite legal
export interface ConfirmacaoLimiteLegal {
  confirmacaoTexto?: string
  aceitoRiscosLegais: boolean
  justificativaAdicional?: string
}

// Configuração dos tipos de alteração para UI
export interface TipoAlteracaoConfig {
  tipo: TipoAlteracao
  label: string
  descricao: string
  icone: string
  cor: string
  exemplos: string[]
  blocosObrigatorios: ('clausulas' | 'vigencia' | 'valor' | 'fornecedores' | 'unidades')[]
  blocosOpcionais: ('clausulas' | 'vigencia' | 'valor' | 'fornecedores' | 'unidades')[]
  limiteLegal?: number // 25 ou 50 para alterações quantitativas
}

// Interface para estado do componente
export interface AlteracaoContratualState {
  alteracoes: AlteracaoContratualForm[]
  alteracaoAtual: Partial<AlteracaoContratualForm> | null
  tiposSelecionados: TipoAlteracao[]
  blocosAtivos: Set<string>
  isLoading: boolean
  errors: Record<string, string>
  alertaLimiteLegal?: {
    tipo: string
    mensagem: string
    percentualAcumulado: number
    limiteAplicavel: number
    requerConfirmacao: boolean
  }
}

// Interface para resumo da alteração
export interface ResumoAlteracao {
  valorOriginal: number
  valorAlteracao: number
  valorFinal: number
  percentualAlteracao: number
  vigenciaOriginal?: string
  vigenciaFinal?: string
  diasAdicionados?: number
  diasTotais?: number
}

// Configuração dos tipos de alteração conforme EGC-174
export const TIPOS_ALTERACAO_CONFIG: Record<TipoAlteracao, TipoAlteracaoConfig> = {
  [TipoAlteracao.AditivoPrazo]: {
    tipo: TipoAlteracao.AditivoPrazo,
    label: 'Aditivo - Prazo',
    descricao: 'Altera vigência do contrato',
    icone: 'Calendar',
    cor: 'blue',
    exemplos: ['Prorrogação por 12 meses', 'Extensão de prazo'],
    blocosObrigatorios: ['vigencia'],
    blocosOpcionais: ['clausulas', 'valor']
  },
  [TipoAlteracao.AditivoQualitativo]: {
    tipo: TipoAlteracao.AditivoQualitativo,
    label: 'Aditivo - Qualitativo',
    descricao: 'Características/especificações',
    icone: 'FileText',
    cor: 'green',
    exemplos: ['Mudança de especificação', 'Alteração no escopo'],
    blocosObrigatorios: [],
    blocosOpcionais: ['clausulas', 'vigencia', 'valor', 'fornecedores', 'unidades'],
    limiteLegal: 50
  },
  [TipoAlteracao.AditivoQuantidade]: {
    tipo: TipoAlteracao.AditivoQuantidade,
    label: 'Aditivo - Quantidade',
    descricao: 'Quantidades de itens/serviços',
    icone: 'Package',
    cor: 'purple',
    exemplos: ['Acréscimo de 25% no quantitativo', 'Redução de itens'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 25
  },
  [TipoAlteracao.Apostilamento]: {
    tipo: TipoAlteracao.Apostilamento,
    label: 'Apostilamento',
    descricao: 'Registro administrativo',
    icone: 'FileSignature',
    cor: 'gray',
    exemplos: ['Registro de mudança', 'Anotação administrativa'],
    blocosObrigatorios: [],
    blocosOpcionais: ['clausulas']
  },
  [TipoAlteracao.Reajuste]: {
    tipo: TipoAlteracao.Reajuste,
    label: 'Reajuste',
    descricao: 'Índices inflacionários',
    icone: 'Calculator',
    cor: 'yellow',
    exemplos: ['Aplicação do IPCA', 'Reajuste anual'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 50
  },
  [TipoAlteracao.Reequilibrio]: {
    tipo: TipoAlteracao.Reequilibrio,
    label: 'Reequilíbrio',
    descricao: 'Equilíbrio econômico-financeiro',
    icone: 'Scale',
    cor: 'orange',
    exemplos: ['Reequilíbrio por aumento de custos', 'Ajuste econômico'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 50
  },
  [TipoAlteracao.Repactuacao]: {
    tipo: TipoAlteracao.Repactuacao,
    label: 'Repactuação',
    descricao: 'Recomposição de preços',
    icone: 'TrendingUp',
    cor: 'red',
    exemplos: ['Revisão de preços', 'Recomposição tarifária'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 50
  },
  [TipoAlteracao.Rescisao]: {
    tipo: TipoAlteracao.Rescisao,
    label: 'Rescisão',
    descricao: 'Encerramento antecipado',
    icone: 'XCircle',
    cor: 'red',
    exemplos: ['Rescisão amigável', 'Encerramento por descumprimento'],
    blocosObrigatorios: ['vigencia'],
    blocosOpcionais: ['clausulas']
  },
  [TipoAlteracao.SubRogacao]: {
    tipo: TipoAlteracao.SubRogacao,
    label: 'Sub-rogação',
    descricao: 'Substituição de partes',
    icone: 'Users',
    cor: 'indigo',
    exemplos: ['Substituição de fornecedor', 'Transferência de contrato'],
    blocosObrigatorios: ['fornecedores'],
    blocosOpcionais: ['clausulas']
  },
  [TipoAlteracao.Supressao]: {
    tipo: TipoAlteracao.Supressao,
    label: 'Supressão',
    descricao: 'Redução de quantidades/valores',
    icone: 'Minus',
    cor: 'red',
    exemplos: ['Redução de 20% no escopo', 'Supressão de itens'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 25
  },
  [TipoAlteracao.Suspensao]: {
    tipo: TipoAlteracao.Suspensao,
    label: 'Suspensão',
    descricao: 'Paralisação temporária',
    icone: 'Pause',
    cor: 'yellow',
    exemplos: ['Suspensão por 30 dias', 'Paralisação temporária'],
    blocosObrigatorios: ['vigencia'],
    blocosOpcionais: ['clausulas']
  },
  [TipoAlteracao.Valor]: {
    tipo: TipoAlteracao.Valor,
    label: 'Alteração de Valor',
    descricao: 'Alteração de valor global',
    icone: 'DollarSign',
    cor: 'green',
    exemplos: ['Aumento de valor', 'Redução de valor'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 25
  },
  [TipoAlteracao.PrazoEValor]: {
    tipo: TipoAlteracao.PrazoEValor,
    label: 'Prazo e Valor',
    descricao: 'Combinação prazo + valor',
    icone: 'Clock',
    cor: 'blue',
    exemplos: ['Prorrogação com reajuste', 'Extensão com aumento'],
    blocosObrigatorios: ['vigencia', 'valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 25
  },
  [TipoAlteracao.RepactuacaoEReequilibrio]: {
    tipo: TipoAlteracao.RepactuacaoEReequilibrio,
    label: 'Repactuação e Reequilíbrio',
    descricao: 'Combinação repactuação + reequilíbrio',
    icone: 'Scale',
    cor: 'red',
    exemplos: ['Revisão completa', 'Ajuste por múltiplos fatores'],
    blocosObrigatorios: ['valor'],
    blocosOpcionais: ['clausulas'],
    limiteLegal: 50
  }
}

// Função helper para verificar blocos obrigatórios
export function getBlocosObrigatorios(tipos: TipoAlteracao[]): Set<string> {
  const blocos = new Set<string>()
  tipos.forEach(tipo => {
    TIPOS_ALTERACAO_CONFIG[tipo].blocosObrigatorios.forEach(bloco => {
      blocos.add(bloco)
    })
  })
  return blocos
}

// Função helper para verificar blocos opcionais
export function getBlocosOpcionais(tipos: TipoAlteracao[]): Set<string> {
  const blocos = new Set<string>()
  tipos.forEach(tipo => {
    TIPOS_ALTERACAO_CONFIG[tipo].blocosOpcionais.forEach(bloco => {
      blocos.add(bloco)
    })
  })
  return blocos
}

// Função helper para obter limite legal
export function getLimiteLegal(tipos: TipoAlteracao[]): number {
  let maiorLimite = 0
  tipos.forEach(tipo => {
    const limite = TIPOS_ALTERACAO_CONFIG[tipo].limiteLegal || 0
    if (limite > maiorLimite) {
      maiorLimite = limite
    }
  })
  return maiorLimite
}

// ========== FUNÇÕES DE TRANSFORMAÇÃO ==========

/**
 * Transforma dados do formulário frontend para payload da API
 * Converte estrutura nested para flat e ajusta tipos
 */
export function transformToApiPayload(
  dados: AlteracaoContratualForm
): AlteracaoContratualPayload {
  const payload: AlteracaoContratualPayload = {
    contratoId: dados.contratoId,
    tiposAlteracao: dados.tiposAlteracao,
    justificativa: dados.dadosBasicos.justificativa,
    dataEfeito: dados.dataEfeito
  }

  // Campos opcionais básicos
  if (dados.dadosBasicos.fundamentoLegal) {
    payload.fundamentoLegal = dados.dadosBasicos.fundamentoLegal
  }
  if (dados.dadosBasicos.observacoes) {
    payload.observacoes = dados.dadosBasicos.observacoes
  }

  // Transformar blocos dinâmicos
  if (dados.blocos.valor) {
    const valor = dados.blocos.valor as BlocoValor
    payload.valor = {
      operacao: valor.operacao,
      valorAjuste: valor.valorAjuste,
      percentualAjuste: valor.percentualAjuste,
      novoValorGlobal: valor.novoValorGlobal,
      valorCalculadoAutomaticamente: valor.valorCalculadoAutomaticamente,
      observacoes: valor.observacoes
    }
  }

  if (dados.blocos.vigencia) {
    const vigencia = dados.blocos.vigencia as BlocoVigencia
    payload.vigencia = {
      operacao: vigencia.operacao,
      valorTempo: vigencia.valorTempo,
      tipoUnidade: vigencia.tipoUnidade,
      novaDataFinal: vigencia.novaDataFinal,
      isIndeterminado: vigencia.isIndeterminado,
      observacoes: vigencia.observacoes
    }
  }

  if (dados.blocos.clausulas) {
    const clausulas = dados.blocos.clausulas as BlocoClausulas
    payload.clausulas = {
      clausulasExcluidas: clausulas.clausulasExcluidas,
      clausulasIncluidas: clausulas.clausulasIncluidas,
      clausulasAlteradas: clausulas.clausulasAlteradas
    }
  }

  if (dados.blocos.fornecedores) {
    const fornecedores = dados.blocos.fornecedores as BlocoFornecedores
    payload.fornecedores = {
      fornecedoresVinculados: fornecedores.fornecedoresVinculados,
      fornecedoresDesvinculados: fornecedores.fornecedoresDesvinculados,
      novoFornecedorPrincipal: fornecedores.novoFornecedorPrincipal,
      observacoes: fornecedores.observacoes
    }
  }

  if (dados.blocos.unidades) {
    const unidades = dados.blocos.unidades as BlocoUnidades
    payload.unidades = {
      unidadesVinculadas: unidades.unidadesVinculadas,
      unidadesDesvinculadas: unidades.unidadesDesvinculadas,
      observacoes: unidades.observacoes
    }
  }

  return payload
}