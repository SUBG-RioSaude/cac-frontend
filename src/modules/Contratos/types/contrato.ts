/**
 * ==========================================
 * TIPAGEM CENTRALIZADA DE CONTRATOS - API
 * ==========================================
 * Fonte única da verdade para entidades de contrato
 * Baseada no modelo da API do backend
 */

// ========== TIPOS BASE ==========

export type ContratoStatus = 
  | 'ativo' 
  | 'vencendo' 
  | 'vencido' 
  | 'suspenso' 
  | 'encerrado'
  | 'rascunho'
  | 'em_aprovacao'

export type TipoContratacao = 
  | 'centralizado' 
  | 'descentralizado'

export type TipoContrato = 
  | 'servicos' 
  | 'obras' 
  | 'fornecimento' 
  | 'concessao'

export type StatusDocumento = 
  | 'pendente'
  | 'em_analise' 
  | 'conferido'
  | 'com_pendencia'
  | 'rejeitado'

// ========== ENTIDADES RELACIONADAS ==========

export interface ContratoUnidadeSaudeDto {
  id: string
  contratoId: string
  unidadeId: string
  nomeUnidade: string
  valorAtribuido: number
  ativo: boolean
}

// ========== TIPOS DA API DE DOCUMENTOS ==========

// Resposta da API documentos-contrato
export interface DocumentoApiResponse {
  id: string
  contratoId: string
  tipoDocumento: string // Nome do tipo ("TermoReferencia", "Homologacao", etc.)
  tipoDocumentoNumero: number // Número do tipo (pode estar incorreto na API)
  nomeTipoDocumento: string // nome amigável do tipo
  urlDocumento: string
  dataEntrega: string // ISO date-time
  observacoes?: string
  ativo: boolean // true = documento entregue/ativado
  dataCadastro: string // ISO date-time
  dataAtualizacao: string // ISO date-time
  usuarioCadastroId: string
  usuarioAtualizacaoId: string
}

// DTO para criação via API
export interface CreateDocumentoApiPayload {
  contratoId: string
  tipoDocumento: number // 1-7
  urlDocumento: string
  dataEntrega: string // ISO date-time
  observacoes?: string
}

// DTO para atualização via API
export interface UpdateDocumentoApiPayload {
  urlDocumento: string
  dataEntrega?: string // ISO date-time
  observacoes?: string
}

// DTO para gestão múltipla de documentos
export interface DocumentoMultiplo {
  tipoDocumento: number // 1-7 conforme API
  urlDocumento: string
  dataEntrega: string // ISO date-time
  observacoes: string
  selecionado: boolean
}

export interface SaveDocumentosMultiplosPayload {
  documentos: DocumentoMultiplo[]
}

// Mapeamento de tipos de documento da API (1-7)
export const TIPOS_DOCUMENTO_API = {
  1: { nome: 'TermoReferencia', descricao: 'Termo de Referência/Edital' },
  2: { nome: 'Homologacao', descricao: 'Homologação' },
  3: { nome: 'AtaRegistroPrecos', descricao: 'Ata de Registro de Preços' },
  4: { nome: 'GarantiaContratual', descricao: 'Garantia Contratual' },
  5: { nome: 'Contrato', descricao: 'Contrato' },
  6: { nome: 'PublicacaoPNCP', descricao: 'Publicação PNCP' },
  7: { nome: 'PublicacaoExtrato', descricao: 'Publicação de Extrato Contratual' },
} as const

// Interface legada para compatibilidade (mantida para componente atual)
export interface DocumentoContratoDto {
  id: string | null
  contratoId: string
  nome: string
  tipo: string // número como string para compatibilidade
  categoria: 'obrigatorio' | 'opcional'
  linkExterno?: string | null
  status: string // baseado no ativo da API
  observacoes?: string
  dataCadastro?: string
  dataAtualizacao?: string | null
  usuarioCadastroId?: string
}

// Documentos - Tipos detalhados (legado, manter para compatibilidade)
export interface TipoDocumento {
  id: string
  nome: string
  icone: string
  cor: string
  descricaoDetalhada: string
  exemplos?: string[]
}

export interface DocumentoContrato {
  id: string
  nome: string
  descricao: string
  tipo: TipoDocumento
  categoria: 'obrigatorio' | 'opcional'
  status: StatusDocumento
  linkExterno?: string
  dataUpload?: string
  dataUltimaVerificacao?: string
  responsavel?: string
  observacoes?: string
  prioridade: number
}

// ========== ENTIDADE PRINCIPAL - API ==========

export interface Contrato {
  id: string
  numeroContrato?: string | null
  numeroCCon?: string | null // Added for compatibility
  processoSei?: string | null
  processoRio?: string | null // New API field
  processoLegado?: string | null // New API field
  numeroProcesso?: string | null // New API field
  categoriaObjeto?: string | null
  descricaoObjeto?: string | null
  objeto?: string | null // Added for compatibility (mapped from descricaoObjeto)
  tipoContratacao?: string | null
  tipoContrato?: string | null
  unidadeDemandante?: string | null
  unidadeGestora?: string | null
  unidade?: string | null // Added for compatibility (mapped from unidadeDemandante)
  contratacao?: string | null
  vigenciaInicial: string // ISO date-time
  vigenciaFinal: string // ISO date-time
  vigenciaOriginalInicial?: string // ISO date-time - Original contract start date
  vigenciaOriginalFinal?: string // ISO date-time - Original contract end date
  dataInicial?: string | null // Added for compatibility (mapped from vigenciaInicial)
  dataFinal?: string | null // Added for compatibility (mapped from vigenciaFinal)
  prazoInicialMeses: number
  prazoOriginalMeses?: number // Original contract duration in months
  valorGlobal: number
  valorGlobalOriginal?: number // New API field for value versioning
  valor?: number | null // Added for compatibility (mapped from valorGlobal)
  formaPagamento?: string | null
  tipoTermoReferencia?: string | null
  termoReferencia?: string | null
  vinculacaoPCA?: string | null
  status?: string | null
  empresaId: string
  // Added for compatibility
  contratada?: {
    razaoSocial: string
    cnpj: string
  } | null
  ativo: boolean
  usuarioCadastroId: string
  usuarioAtualizacaoId: string
  dataCadastro: string // ISO date-time
  dataAtualizacao: string // ISO date-time
  unidadesVinculadas?: ContratoUnidadeSaudeDto[] | null
  documentos?: DocumentoContratoDto[] | null
  valorTotalAtribuido: number
  valorDisponivel: number
  quantidadeUnidadesVinculadas: number
  quantidadeDocumentos: number
}

// ========== INTERFACES ESTENDIDAS ==========

// Responsáveis (legado - para tela de visualização)
export interface Responsavel {
  id: string
  nome: string
  email: string
  telefone?: string
  cargo: string
  dataDesignacao: string
}

export interface Contato {
  tipo: 'email' | 'celular' | 'telefone'
  valor: string
  principal?: boolean
}

export interface Endereco {
  cep: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
}

export interface UnidadeVinculada {
  nome: string
  percentualValor: number
  valorTotalMensal: number
}

export interface AlteracaoContrato {
  id: string
  tipo:
    | 'criacao'
    | 'designacao_fiscais'
    | 'primeiro_pagamento'
    | 'atualizacao_documentos'
    | 'alteracao_valor'
    | 'prorrogacao'
    | 'documento_entregue'
    | 'alteracao_contratual'
    | 'qualitativo'
    | 'prazo_aditivo'
    | 'repactuacao'
    | 'quantidade'
    | 'reajuste'
  descricao: string
  dataHora: string
  responsavel: string
  detalhes?: unknown
  
  // Campos estendidos da nova API
  resumoAlteracao?: string
  tiposAlteracao?: number[]
  status?: number
  versaoContrato?: number
  dataEfeito?: string
  requerConfirmacaoLimiteLegal?: boolean
  alertaLimiteLegal?: string
  
  // Dados dos blocos estruturados
  vigencia?: {
    operacao: number
    tipoUnidade?: number
    valorTempo?: number
    novaDataFinal?: string | null
    isIndeterminado?: boolean
    observacoes?: string
  }
  
  valor?: {
    operacao: number
    valorAjuste?: number
    percentualAjuste?: number | null
    novoValorGlobal?: number | null
    observacoes?: string
    valorCalculadoAutomaticamente?: boolean
  }
  
  fornecedores?: {
    fornecedoresVinculados?: string[]
    fornecedoresDesvinculados?: string[]
    novoFornecedorPrincipal?: string | null
    observacoes?: string | null
  }
  
  unidades?: {
    unidadesVinculadas?: string[]
    unidadesDesvinculadas?: string[]
    observacoes?: string | null
  }
  
  clausulas?: {
    clausulasExcluidas?: string
    clausulasIncluidas?: string
    clausulasAlteradas?: string
  }
}

export interface PeriodoVigencia {
  inicio: string
  fim: string
  descricao: string
  status: 'concluido' | 'em_andamento' | 'pendente'
}

// Contrato Detalhado (para tela de visualização - combina API + campos legado)
export interface ContratoDetalhado extends Omit<Contrato, 'documentos'> {
  // Campos legado para compatibilidade
  numeroContrato: string // override para obrigatório
  objeto: string // mapeado de descricaoObjeto
  dataInicio: string // mapeado de vigenciaInicial
  dataTermino: string // mapeado de vigenciaFinal
  valorTotal: number // mapeado de valorGlobal

  // Informações CCon
  ccon?: {
    numero: string
    dataInicio: string
    dataTermino: string
  }

  // Responsáveis
  responsaveis: {
    fiscaisAdministrativos: Responsavel[]
    gestores: Responsavel[]
  }

  // Fornecedor
  fornecedor: {
    razaoSocial: string
    cnpj: string
    contatos: Contato[]
    inscricaoEstadual?: string
    inscricaoMunicipal?: string
    endereco: Endereco
  }

  // Unidades
  unidades: {
    demandante: string
    gestora: string
    vinculadas: UnidadeVinculada[]
  }

  // Alterações
  alteracoes: AlteracaoContrato[]

  // Documentos (tipo legado para compatibilidade - override do tipo da API)
  documentos: DocumentoContrato[]
  documentosChecklist: ChecklistData

  // Indicadores
  indicadores: {
    saldoAtual: number
    percentualExecutado: number
    cronogramaVigencia: PeriodoVigencia[]
  }
}

// ========== CHECKLIST DE DOCUMENTOS ==========

export interface DocumentoChecklist {
  entregue: boolean
  link?: string
  dataEntrega?: string // ISO date string
}

export interface ChecklistData {
  termoReferencia: DocumentoChecklist
  homologacao: DocumentoChecklist
  ataRegistroPrecos: DocumentoChecklist
  garantiaContratual: DocumentoChecklist
  contrato: DocumentoChecklist
  publicacaoPncp: DocumentoChecklist
  publicacaoExtrato: DocumentoChecklist
}

// ========== INTERFACES PARA UI ==========

// Interface para listagem (versão simplificada)
export interface ContratoLista {
  id: string
  numeroContrato?: string | null
  processoSei?: string | null
  descricaoObjeto?: string | null
  valorGlobal: number
  vigenciaInicial: string
  vigenciaFinal: string
  status?: string | null
  empresaId: string
  unidadeDemandante?: string | null
  ativo: boolean
  // Campos computados para UI
  diasVigente?: number
  percentualExecutado?: number
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

// ========== ESTATÍSTICAS E FILTROS ==========

export interface FiltroDocumento {
  categoria?: 'obrigatorio' | 'opcional' | 'todos'
  status?: StatusDocumento | 'todos'
  tipo?: string | 'todos'
  busca?: string
}

export interface EstatisticaDocumentos {
  total: number
  conferidos: number
  pendentes: number
  comPendencia: number
  percentualCompleto: number
  obrigatoriosPendentes: number
}

// ========== TIPOS DE DOCUMENTOS PADRÃO ==========

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  {
    id: 'edital',
    nome: 'Edital',
    icone: 'FileText',
    cor: 'blue',
    descricaoDetalhada: 'Documento de licitação que estabelece as regras do processo',
    exemplos: ['Edital de Pregão', 'Edital de Concorrência']
  },
  {
    id: 'proposta',
    nome: 'Proposta Comercial',
    icone: 'DollarSign',
    cor: 'green',
    descricaoDetalhada: 'Proposta apresentada pelo fornecedor',
    exemplos: ['Proposta de Preços', 'Proposta Técnica']
  },
  {
    id: 'contrato',
    nome: 'Contrato Assinado',
    icone: 'FileCheck',
    cor: 'purple',
    descricaoDetalhada: 'Documento contratual assinado pelas partes'
  },
  {
    id: 'garantia',
    nome: 'Garantia Contratual',
    icone: 'Shield',
    cor: 'orange',
    descricaoDetalhada: 'Garantia apresentada para execução do contrato',
    exemplos: ['Seguro Garantia', 'Fiança Bancária', 'Depósito em Dinheiro']
  },
  {
    id: 'documentos_habilitacao',
    nome: 'Documentos de Habilitação',
    icone: 'Award',
    cor: 'teal',
    descricaoDetalhada: 'Documentos que comprovam a habilitação da empresa',
    exemplos: ['Certidões Negativas', 'Balanço Patrimonial', 'Atestados']
  },
  {
    id: 'aditivo',
    nome: 'Termo Aditivo',
    icone: 'FilePlus',
    cor: 'indigo',
    descricaoDetalhada: 'Documentos de alteração do contrato original'
  },
  {
    id: 'apostila',
    nome: 'Apostila',
    icone: 'FileSignature',
    cor: 'pink',
    descricaoDetalhada: 'Averbação de alterações não substanciais'
  },
  {
    id: 'ordem_servico',
    nome: 'Ordem de Serviço',
    icone: 'Play',
    cor: 'emerald',
    descricaoDetalhada: 'Autorização para início dos trabalhos'
  },
  {
    id: 'nota_fiscal',
    nome: 'Notas Fiscais',
    icone: 'Receipt',
    cor: 'amber',
    descricaoDetalhada: 'Documentos fiscais de cobrança'
  },
  {
    id: 'outros',
    nome: 'Outros Documentos',
    icone: 'File',
    cor: 'gray',
    descricaoDetalhada: 'Documentos diversos relacionados ao contrato'
  }
]
