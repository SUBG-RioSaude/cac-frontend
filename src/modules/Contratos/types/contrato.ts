/**
 * ==========================================
 * TIPAGEM CENTRALIZADA DE CONTRATOS - API
 * ==========================================
 * Fonte Ãºnica da verdade para entidades de contrato
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

export interface UnidadeResponsavel {
  id: string
  contratoId: string
  unidadeSaudeId: string
  unidadeSaudeNome: string
  tipoResponsabilidade: number // 1 = Demandante, 2 = Gestora
  tipoResponsabilidadeDescricao: string // "Demandante" | "Gestora"
  principal: boolean // Se Ã© a unidade principal para esse tipo
  observacoes?: string
  ativo: boolean
  dataCadastro: string
  dataAtualizacao: string
  usuarioCadastroId: string
  usuarioAtualizacaoId: string
  usuarioCadastroNome?: string | null
  usuarioAtualizacaoNome?: string | null
}

export interface ContratoUnidadeSaudeDto {
  id: string
  contratoId: string
  unidadeSaudeId: string // Corrigido: API retorna unidadeSaudeId, nÃ£o unidadeId
  nomeUnidade?: string // Opcional: pode nÃ£o vir da API
  valorAtribuido: number
  percentualValor?: number
  vigenciaInicialUnidade?: string
  vigenciaFinalUnidade?: string
  observacoes?: string
  ativo: boolean
  dataCadastro?: string
  dataAtualizacao?: string
  usuarioCadastroId?: string
  usuarioAtualizacaoId?: string
}

// ========== TIPOS DA API DE DOCUMENTOS ==========

// Resposta da API documentos-contrato
export interface DocumentoApiResponse {
  id: string
  contratoId: string
  tipoDocumento: string // Nome do tipo ("TermoReferencia", "Homologacao", etc.)
  tipoDocumentoNumero: number // NÃºmero do tipo (pode estar incorreto na API)
  nomeTipoDocumento: string // nome amigÃ¡vel do tipo
  urlDocumento: string
  dataEntrega: string // ISO date-time
  observacoes?: string
  ativo: boolean // true = documento entregue/ativado
  dataCadastro: string // ISO date-time
  dataAtualizacao: string // ISO date-time
  usuarioCadastroId: string
  usuarioAtualizacaoId: string
}

// DTO para criaÃ§Ã£o via API
export interface CreateDocumentoApiPayload {
  contratoId: string
  tipoDocumento: number // 1-7
  urlDocumento: string
  dataEntrega: string // ISO date-time
  observacoes?: string
}

// DTO para atualizaÃ§Ã£o via API
export interface UpdateDocumentoApiPayload {
  urlDocumento: string
  dataEntrega?: string // ISO date-time
  observacoes?: string
}

// DTO para gestÃ£o mÃºltipla de documentos
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
  1: { nome: 'TermoReferencia', descricao: 'Termo de ReferÃªncia/Edital' },
  2: { nome: 'Homologacao', descricao: 'HomologaÃ§Ã£o' },
  3: { nome: 'AtaRegistroPrecos', descricao: 'Ata de Registro de PreÃ§os' },
  4: { nome: 'GarantiaContratual', descricao: 'Garantia Contratual' },
  5: { nome: 'Contrato', descricao: 'Contrato' },
  6: { nome: 'PublicacaoPNCP', descricao: 'PublicaÃ§Ã£o PNCP' },
  7: { nome: 'PublicacaoExtrato', descricao: 'PublicaÃ§Ã£o de Extrato Contratual' },
} as const

// Interface legada para compatibilidade (mantida para componente atual)
export interface DocumentoContratoDto {
  id: string | null
  contratoId: string
  nome: string
  tipo: string // nÃºmero como string para compatibilidade
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
  // Novos campos da API
  empresaRazaoSocial?: string | null
  empresaCnpj?: string | null
  unidadeGestoraNomeCompleto?: string | null
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
  unidadesResponsaveis?: UnidadeResponsavel[] | null // Novo campo para unidades responsÃ¡veis
  valorTotalAtribuido: number
  valorDisponivel: number
  vtmTotalContrato: number // Valor Total MÃ©dio do contrato (valor mensal mÃ©dio)
  quantidadeUnidadesVinculadas: number
  quantidadeDocumentos: number
}

// ========== INTERFACES ESTENDIDAS ==========

// ResponsÃ¡veis (legado - para tela de visualizaÃ§Ã£o)
export interface Responsavel {
  id: string
  nome: string
  email: string
  telefone?: string
  cargo: string
  dataDesignacao: string
}

export interface ContratoFuncionario {
  id: string
  contratoId: string
  funcionarioId: string
  tipoGerencia: number // 1 = Fiscal, 2 = Gestor
  tipoGerenciaDescricao: string
  dataInicio: string // ISO date
  dataFim: string | null
  motivoAlteracao: number
  motivoAlteracaoDescricao: string
  documentoDesignacao: string | null
  observacoes: string | null
  estaAtivo: boolean
  diasNaFuncao: number
  periodoFormatado: string
  funcionarioNome: string
  funcionarioMatricula: string
  funcionarioCargo: string
  dataCadastro: string // ISO date-time
  dataAtualizacao: string // ISO date-time
  ativo: boolean
  // Campos opcionais para compatibilidade
  email?: string
  telefone?: string
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

// Contrato Detalhado (para tela de visualizaÃ§Ã£o - combina API + campos legado)
export interface ContratoDetalhado extends Omit<Contrato, 'documentos'> {
  // Campos legado para compatibilidade
  numeroContrato: string // override para obrigatÃ³rio
  objeto: string // mapeado de descricaoObjeto
  dataInicio: string // mapeado de vigenciaInicial
  dataTermino: string // mapeado de vigenciaFinal
  valorTotal: number // mapeado de valorGlobal
  vtmTotalContrato: number // Valor Total MÃ©dio do contrato (valor mensal mÃ©dio)
  
  // IDs das unidades para busca de nomes
  unidadeDemandanteId?: string | null
  unidadeGestoraId?: string | null

  // InformaÃ§Ãµes CCon
  ccon?: {
    numero: string
    dataInicio: string
    dataTermino: string
  }

  // ResponsÃ¡veis
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

  // AlteraÃ§Ãµes
  alteracoes: AlteracaoContrato[]

  // Documentos (tipo legado para compatibilidade - override do tipo da API)
  documentos: DocumentoContrato[]
  documentosChecklist: ChecklistData

  // FuncionÃ¡rios vinculados ao contrato (nova API)
  funcionarios?: ContratoFuncionario[]

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

// Interface para listagem (versÃ£o simplificada)
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

// ========== ESTATÃSTICAS E FILTROS ==========

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

// ========== TIPOS DE DOCUMENTOS PADRÃƒO ==========

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  {
    id: 'edital',
    nome: 'Edital',
    icone: 'FileText',
    cor: 'blue',
    descricaoDetalhada: 'Documento de licitaÃ§Ã£o que estabelece as regras do processo',
    exemplos: ['Edital de PregÃ£o', 'Edital de ConcorrÃªncia']
  },
  {
    id: 'proposta',
    nome: 'Proposta Comercial',
    icone: 'DollarSign',
    cor: 'green',
    descricaoDetalhada: 'Proposta apresentada pelo fornecedor',
    exemplos: ['Proposta de PreÃ§os', 'Proposta TÃ©cnica']
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
    descricaoDetalhada: 'Garantia apresentada para execuÃ§Ã£o do contrato',
    exemplos: ['Seguro Garantia', 'FianÃ§a BancÃ¡ria', 'DepÃ³sito em Dinheiro']
  },
  {
    id: 'documentos_habilitacao',
    nome: 'Documentos de HabilitaÃ§Ã£o',
    icone: 'Award',
    cor: 'teal',
    descricaoDetalhada: 'Documentos que comprovam a habilitaÃ§Ã£o da empresa',
    exemplos: ['CertidÃµes Negativas', 'BalanÃ§o Patrimonial', 'Atestados']
  },
  {
    id: 'aditivo',
    nome: 'Termo Aditivo',
    icone: 'FilePlus',
    cor: 'indigo',
    descricaoDetalhada: 'Documentos de alteraÃ§Ã£o do contrato original'
  },
  {
    id: 'apostila',
    nome: 'Apostila',
    icone: 'FileSignature',
    cor: 'pink',
    descricaoDetalhada: 'AverbaÃ§Ã£o de alteraÃ§Ãµes nÃ£o substanciais'
  },
  {
    id: 'ordem_servico',
    nome: 'Ordem de ServiÃ§o',
    icone: 'Play',
    cor: 'emerald',
    descricaoDetalhada: 'AutorizaÃ§Ã£o para inÃ­cio dos trabalhos'
  },
  {
    id: 'nota_fiscal',
    nome: 'Notas Fiscais',
    icone: 'Receipt',
    cor: 'amber',
    descricaoDetalhada: 'Documentos fiscais de cobranÃ§a'
  },
  {
    id: 'outros',
    nome: 'Outros Documentos',
    icone: 'File',
    cor: 'gray',
    descricaoDetalhada: 'Documentos diversos relacionados ao contrato'
  }
]

// ========== TIPOS PARA EMPENHOS ==========

// Interface para empenho
export interface Empenho {
  id: string
  contratoId: string
  unidadeSaudeId: string
  nomeUnidade: string
  numeroEmpenho: string
  valor: number
  dataEmpenho: string
  observacao?: string
  ativo: boolean
  dataCadastro: string
  dataAtualizacao: string
}

// Interface para criaÃ§Ã£o de empenho via API
export interface CriarEmpenhoPayload {
  contratoId: string
  unidadeSaudeId: string
  numeroEmpenho: string
  valor: number
  dataEmpenho: string
  observacao?: string
}

// Interface para atualizaÃ§Ã£o de empenho via API
export interface AtualizarEmpenhoPayload {
  valor: number
  dataEmpenho: string
  observacao?: string
}

// Interface para formulÃ¡rio de empenho
export interface EmpenhoForm {
  id?: string
  unidadeSaudeId: string
  numeroEmpenho: string
  valor: number | string
  dataEmpenho: string
  observacao: string
}

// Interface para validaÃ§Ã£o de empenho
export interface ValidacaoEmpenho {
  numeroEmpenho: {
    valido: boolean
    erro?: string
  }
  valor: {
    valido: boolean
    erro?: string
  }
  limite: {
    valido: boolean
    erro?: string
  }
  dataEmpenho: {
    valido: boolean
    erro?: string
  }
  numeroUnico: {
    valido: boolean
    erro?: string
  }
}

// ========== TIPOS PARA CRIAÃ‡ÃƒO DE CONTRATOS ==========

// Interface para criaÃ§Ã£o de unidade responsÃ¡vel no payload
export interface CriarUnidadeResponsavelPayload {
  unidadeSaudeId: string
  tipoResponsabilidade: number // 1 = Demandante, 2 = Gestora
  principal: boolean
  observacoes?: string
}

// Interface NOVA para criaÃ§Ã£o de contrato via API (usando unidadesResponsaveis)
export interface CriarContratoPayload {
  numeroContrato: string
  processoSei?: string
  processoRio?: string
  processoLegado?: string
  categoriaObjeto: string
  descricaoObjeto: string
  tipoContratacao: string
  tipoContrato: string
  unidadesResponsaveis: CriarUnidadeResponsavelPayload[] // NOVO: array de unidades responsÃ¡veis
  contratacao: string
  vigenciaInicial: string // ISO date-time
  vigenciaFinal: string // ISO date-time
  prazoInicialMeses: number
  valorGlobal: number
  formaPagamento: string
  tipoTermoReferencia: string
  termoReferencia: string
  vinculacaoPCA: string
  empresaId: string
  ativo: boolean
  unidadesVinculadas: UnidadeVinculadaPayload[]
  funcionarios: FuncionarioContratoPayload[]
}

// Interface LEGADA para compatibilidade (serÃ¡ removida futuramente)
export interface CriarContratoPayloadLegado {
  numeroContrato: string
  processoSei?: string
  processoRio?: string
  processoLegado?: string
  categoriaObjeto: string
  descricaoObjeto: string
  tipoContratacao: string
  tipoContrato: string
  unidadeDemandanteId: string
  unidadeGestoraId: string
  contratacao: string
  vigenciaInicial: string // ISO date-time
  vigenciaFinal: string // ISO date-time
  prazoInicialMeses: number
  valorGlobal: number
  formaPagamento: string
  tipoTermoReferencia: string
  termoReferencia: string
  vinculacaoPCA: string
  empresaId: string
  ativo: boolean
  unidadesVinculadas: UnidadeVinculadaPayload[]
  funcionarios: FuncionarioContratoPayload[]
}

// Interface para unidades vinculadas ao contrato
export interface UnidadeVinculadaPayload {
  unidadeSaudeId: string
  valorAtribuido: number
  vigenciaInicialUnidade: string // ISO date-time
  vigenciaFinalUnidade: string // ISO date-time
  observacoes?: string
}

// Interface para funcionÃ¡rios do contrato
export interface FuncionarioContratoPayload {
  funcionarioId: string
  tipoGerencia: typeof TipoGerencia[keyof typeof TipoGerencia] // 1=Fiscal, 2=Gestor
  observacoes?: string
}

// Enum para tipo de gerÃªncia
export const TipoGerencia = {
  FISCAL: 1,
  GESTOR: 2
} as const

// ========== FUNÃ‡Ã•ES AUXILIARES PARA UNIDADES RESPONSÃVEIS ==========

/**
 * Extrai a unidade demandante principal de um contrato
 * @param contrato - Contrato com campo unidadesResponsaveis
 * @returns Unidade demandante principal ou undefined
 */
export function getUnidadeDemandantePrincipal(contrato: Contrato | ContratoDetalhado): UnidadeResponsavel | undefined {
  if (!contrato.unidadesResponsaveis || contrato.unidadesResponsaveis.length === 0) {
    return undefined
  }
  
  return contrato.unidadesResponsaveis.find(
    unidade => unidade.tipoResponsabilidade === 1 && // 1 = Demandante
               unidade.principal === true &&
               unidade.ativo === true
  )
}

/**
 * Extrai a unidade gestora principal de um contrato
 * @param contrato - Contrato com campo unidadesResponsaveis
 * @returns Unidade gestora principal ou undefined
 */
export function getUnidadeGestoraPrincipal(contrato: Contrato | ContratoDetalhado): UnidadeResponsavel | undefined {
  if (!contrato.unidadesResponsaveis || contrato.unidadesResponsaveis.length === 0) {
    return undefined
  }
  
  return contrato.unidadesResponsaveis.find(
    unidade => unidade.tipoResponsabilidade === 2 && // 2 = Gestora
               unidade.principal === true &&
               unidade.ativo === true
  )
}

/**
 * ObtÃ©m todas as unidades demandantes de um contrato
 * @param contrato - Contrato com campo unidadesResponsaveis
 * @returns Array de unidades demandantes ativas
 */
export function getUnidadesDemandantes(contrato: Contrato | ContratoDetalhado): UnidadeResponsavel[] {
  if (!contrato.unidadesResponsaveis || contrato.unidadesResponsaveis.length === 0) {
    return []
  }
  
  return contrato.unidadesResponsaveis.filter(
    unidade => unidade.tipoResponsabilidade === 1 && // 1 = Demandante
               unidade.ativo === true
  )
}

/**
 * ObtÃ©m todas as unidades gestoras de um contrato
 * @param contrato - Contrato com campo unidadesResponsaveis
 * @returns Array de unidades gestoras ativas
 */
export function getUnidadesGestoras(contrato: Contrato | ContratoDetalhado): UnidadeResponsavel[] {
  if (!contrato.unidadesResponsaveis || contrato.unidadesResponsaveis.length === 0) {
    return []
  }
  
  return contrato.unidadesResponsaveis.filter(
    unidade => unidade.tipoResponsabilidade === 2 && // 2 = Gestora
               unidade.ativo === true
  )
}

/**
 * Compatibilidade: extrai nome da unidade demandante principal para uso legado
 * @param contrato - Contrato com campo unidadesResponsaveis
 * @returns Nome da unidade demandante principal ou string vazia
 */
export function getLegacyUnidadeDemandante(contrato: Contrato | ContratoDetalhado): string {
  // Priorizar campo legado se existir
  if (contrato.unidadeDemandante) {
    return contrato.unidadeDemandante
  }
  
  // Buscar na nova estrutura
  const unidadePrincipal = getUnidadeDemandantePrincipal(contrato)
  return unidadePrincipal?.unidadeSaudeNome || ''
}

/**
 * Compatibilidade: extrai nome da unidade gestora principal para uso legado
 * @param contrato - Contrato com campo unidadesResponsaveis
 * @returns Nome da unidade gestora principal ou string vazia
 */
export function getLegacyUnidadeGestora(contrato: Contrato | ContratoDetalhado): string {
  // Priorizar campo legado se existir
  if (contrato.unidadeGestora) {
    return contrato.unidadeGestora
  }
  
  // Buscar na nova estrutura
  const unidadePrincipal = getUnidadeGestoraPrincipal(contrato)
  return unidadePrincipal?.unidadeSaudeNome || ''
}

// ========== TRANSFORMERS PARA CONVERSÃƒO BIDIRECIONAL ==========

/**
 * Converte dados do formulÃ¡rio legado (campos Ãºnicos) para array unidadesResponsaveis
 * @param unidadeDemandanteId - ID da unidade demandante
 * @param unidadeGestoraId - ID da unidade gestora  
 * @returns Array de unidades responsÃ¡veis para o payload da API
 */
export function transformLegacyToUnidadesResponsaveis(
  unidadeDemandanteId: string, 
  unidadeGestoraId: string
): CriarUnidadeResponsavelPayload[] {
  const unidadesResponsaveis: CriarUnidadeResponsavelPayload[] = []
  
  // Adicionar unidade demandante se fornecida
  if (unidadeDemandanteId && unidadeDemandanteId.trim() !== '') {
    unidadesResponsaveis.push({
      unidadeSaudeId: unidadeDemandanteId,
      tipoResponsabilidade: 1, // 1 = Demandante
      principal: false,
      observacoes: 'Unidade demandante'
    })
  }
  
  // Adicionar unidade gestora se fornecida
  if (unidadeGestoraId && unidadeGestoraId.trim() !== '') {
    unidadesResponsaveis.push({
      unidadeSaudeId: unidadeGestoraId,
      tipoResponsabilidade: 2, // 2 = Gestora
      principal: false,
      observacoes: 'Unidade gestora'
    })
  }
  
  return unidadesResponsaveis
}

/**
 * Converte array unidadesResponsaveis de volta para campos Ãºnicos (para compatibilidade)
 * @param unidadesResponsaveis - Array de unidades responsÃ¡veis da API
 * @returns Objeto com IDs das unidades demandante e gestora principais
 */
export function transformUnidadesResponsaveisToLegacy(
  unidadesResponsaveis?: UnidadeResponsavel[]
): { unidadeDemandanteId?: string; unidadeGestoraId?: string } {
  if (!unidadesResponsaveis || unidadesResponsaveis.length === 0) {
    return {}
  }
  
  const unidadeDemandante = unidadesResponsaveis.find(
    u => u.tipoResponsabilidade === 1 && u.principal && u.ativo
  )
  
  const unidadeGestora = unidadesResponsaveis.find(
    u => u.tipoResponsabilidade === 2 && u.principal && u.ativo
  )
  
  return {
    unidadeDemandanteId: unidadeDemandante?.unidadeSaudeId,
    unidadeGestoraId: unidadeGestora?.unidadeSaudeId
  }
}

/**
 * Converte payload legado para novo formato da API
 * @param payloadLegado - Payload no formato antigo com campos Ãºnicos
 * @returns Payload no novo formato com array unidadesResponsaveis
 */
export function transformLegacyPayloadToNew(
  payloadLegado: CriarContratoPayloadLegado
): CriarContratoPayload {
  const { unidadeDemandanteId, unidadeGestoraId, ...restPayload } = payloadLegado
  
  return {
    ...restPayload,
    unidadesResponsaveis: transformLegacyToUnidadesResponsaveis(
      unidadeDemandanteId, 
      unidadeGestoraId
    )
  }
}

/**
 * Valida se o array de unidades responsÃ¡veis tem pelo menos uma demandante e uma gestora
 * @param unidadesResponsaveis - Array de unidades responsÃ¡veis
 * @returns Objeto com resultado da validaÃ§Ã£o
 */
export function validateUnidadesResponsaveis(
  unidadesResponsaveis: CriarUnidadeResponsavelPayload[]
): {
  isValid: boolean
  errors: string[]
  temDemandante: boolean
  temGestora: boolean
} {
  const errors: string[] = []
  
  const demandantes = unidadesResponsaveis.filter(u => u.tipoResponsabilidade === 1)
  const gestoras = unidadesResponsaveis.filter(u => u.tipoResponsabilidade === 2)
  
  const temDemandante = demandantes.length > 0
  const temGestora = gestoras.length > 0
  
  if (!temDemandante) {
    errors.push('unidade demandante é obrigatória')
  }
  
  if (!temGestora) {
    errors.push('unidade gestora é obrigatória')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    temDemandante,
    temGestora
  }
}


