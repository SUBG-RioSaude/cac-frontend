/**
 * ==========================================
 * TIPAGEM DE RELATÓRIOS CONTRATUAIS
 * ==========================================
 * Tipos para geração de relatórios em PDF
 */

import type { ContratoStatus, TipoContrato } from '@/modules/Contratos/types/contrato'

// ========== TIPOS BASE ==========

export type TipoRelatorio =
  | 'execucao'
  | 'desempenho'
  | 'formalizacao'
  | 'prorrogacao'
  | 'encerramento'

export type TipoCampo = 'texto' | 'numero' | 'data' | 'moeda' | 'tabela' | 'grafico'

// ========== DADOS DO RELATÓRIO ==========

export interface DadosRelatorio {
  tipo: TipoRelatorio
  contratos: ContratoRelatorio[]
  dataGeracao: string
  parametros: ParametrosRelatorio
  campos?: CampoRelatorio[]
  graficos?: GraficosRelatorio
}

export interface ContratoRelatorio {
  id: string
  numeroContrato: string
  numeroProcesso?: string
  processoSei?: string
  objeto: string
  descricaoObjeto?: string
  tipoContrato: TipoContrato
  status: ContratoStatus
  contratada: ContratadaRelatorio
  valores: ValoresRelatorio
  vigencia: VigenciaRelatorio
  empenhos: EmpenhoRelatorio[]
  alteracoes: AlteracaoRelatorio[]
  documentos: DocumentoRelatorio[]
  unidades: UnidadesRelatorio
  responsaveis: ResponsaveisRelatorio
}

export interface ContratadaRelatorio {
  id: string
  razaoSocial: string
  cnpj: string
  nomeFantasia?: string
  email?: string
  telefone?: string
  endereco?: EnderecoRelatorio
}

export interface EnderecoRelatorio {
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

export interface ValoresRelatorio {
  global: number
  globalOriginal?: number
  empenhado: number
  executado?: number
  saldo: number
  percentualExecutado: number
  percentualEmpenhado?: number
  vtmMensal?: number // Valor Total Médio mensal
}

export interface VigenciaRelatorio {
  inicial: string // ISO date
  final: string // ISO date
  inicialOriginal?: string
  finalOriginal?: string
  prazoMeses: number
  prazoMesesOriginal?: number
  diasVigente: number
  diasRestantes: number
  diasTotais: number
  percentualTemporal: number
}

export interface EmpenhoRelatorio {
  id: string
  numero: string
  numeroEmpenho: string
  valor: number
  data: string // ISO date
  dataEmpenho: string
  tipo?: string
  unidadeNome?: string
  observacao?: string
}

export interface AlteracaoRelatorio {
  id: string
  tipo: string
  tipoNumero: number
  descricao: string
  justificativa?: string
  valor?: number
  prazo?: number
  data: string // ISO date
  dataAlteracao: string
  numeroAditivo?: string
  status?: string
}

export interface DocumentoRelatorio {
  id: string
  tipo: string
  tipoNumero: number
  descricao: string
  entregue: boolean
  dataEntrega?: string // ISO date
  urlDocumento?: string
  observacoes?: string
}

export interface UnidadesRelatorio {
  demandantePrincipal?: UnidadeRelatorio
  gestoraPrincipal?: UnidadeRelatorio
  demandantes: UnidadeRelatorio[]
  gestoras: UnidadeRelatorio[]
  vinculadas: UnidadeVinculadaRelatorio[]
}

export interface UnidadeRelatorio {
  id: string
  nome: string
  codigo?: string
  tipo?: string
  principal?: boolean
}

export interface UnidadeVinculadaRelatorio extends UnidadeRelatorio {
  valorAtribuido: number
  percentualValor?: number
  vigenciaInicial?: string
  vigenciaFinal?: string
}

export interface ResponsaveisRelatorio {
  gestores: FuncionarioRelatorio[]
  fiscais: FuncionarioRelatorio[]
  fiscaisSubstitutos?: FuncionarioRelatorio[]
}

export interface FuncionarioRelatorio {
  id: string
  nome: string
  cargo?: string
  matricula?: string
  cpf?: string
  email?: string
  telefone?: string
  tipo?: string // 'gestor' | 'fiscal' | 'fiscal_substituto'
}

// ========== PARÂMETROS E CONFIGURAÇÃO ==========

export interface ParametrosRelatorio {
  filtros: FiltrosRelatorio
  contratoIds: string[]
  camposPersonalizados?: string[]
  templateId?: string
  incluirGraficos?: boolean
  incluirDetalhamento?: boolean
}

export interface FiltrosRelatorio {
  dataInicial?: string
  dataFinal?: string
  status?: ContratoStatus[]
  tipoContrato?: TipoContrato[]
  empresaId?: string
  unidadeSaudeId?: string
  valorMinimo?: number
  valorMaximo?: number
  termoPesquisa?: string
}

// ========== CAMPOS PERSONALIZÁVEIS ==========

export interface CampoRelatorio {
  id: string
  nome: string
  nomeExibicao: string
  secao: string
  tipo: TipoCampo
  obrigatorio: boolean
  visivel: boolean
  ordem: number
  descricao?: string
  formatacao?: string // Ex: 'moeda-BRL', 'data-DD/MM/YYYY'
}

export interface SecaoRelatorio {
  id: string
  nome: string
  ordem: number
  campos: CampoRelatorio[]
  visivel: boolean
}

// ========== GRÁFICOS ==========

export interface GraficosRelatorio {
  execucaoFinanceira?: string // Base64 image
  execucaoTemporal?: string
  distribuicaoEmpenhos?: string
  distribuicaoUnidades?: string
  evolucaoMensal?: string
  [key: string]: string | undefined
}

export interface ConfiguracaoGrafico {
  tipo: 'pizza' | 'barra' | 'linha' | 'radar' | 'area'
  titulo: string
  largura: number
  altura: number
  dados: any[]
  cores?: string[]
}

// ========== INDICADORES E MÉTRICAS ==========

export interface IndicadoresRelatorio {
  financeiros: IndicadoresFinanceiros
  temporais: IndicadoresTemporais
  execucao: IndicadoresExecucao
  alertas: AlertaRelatorio[]
}

export interface IndicadoresFinanceiros {
  valorGlobal: number
  valorEmpenhado: number
  valorExecutado: number
  saldoAtual: number
  percentualEmpenhado: number
  percentualExecutado: number
  vtmMensal: number
  ticketMedio?: number
}

export interface IndicadoresTemporais {
  diasVigente: number
  diasRestantes: number
  diasTotais: number
  percentualDecorrido: number
  dataInicio: string
  dataTermino: string
  prorrogacoes: number
  diasProrrogados: number
}

export interface IndicadoresExecucao {
  statusExecucao: 'normal' | 'atencao' | 'critico'
  velocidadeExecucao: number // % executado / % tempo decorrido
  projecaoTermino: string | null
  saldoProjetado: number
  alertaLimite: boolean
  percentualLimiteUsado?: number
}

export interface AlertaRelatorio {
  tipo: 'info' | 'aviso' | 'erro'
  categoria: 'financeiro' | 'temporal' | 'documental' | 'contratual'
  mensagem: string
  severidade: 'baixa' | 'media' | 'alta'
  dados?: any
}

// ========== METADADOS DO RELATÓRIO ==========

export interface MetadataRelatorio {
  id: string
  tipo: TipoRelatorio
  titulo: string
  descricao?: string
  versao: string
  dataGeracao: string
  usuarioGerador: UsuarioRelatorio
  quantidadeContratos: number
  quantidadePaginas?: number
  tamanhoBytes?: number
  formatoArquivo: 'pdf' | 'excel' | 'csv'
}

export interface UsuarioRelatorio {
  id: string
  nome: string
  email?: string
  cargo?: string
}

// ========== RESULTADO DA GERAÇÃO ==========

export interface ResultadoGeracao {
  sucesso: boolean
  metadata: MetadataRelatorio
  blob?: Blob
  url?: string
  erros?: ErroGeracao[]
  avisos?: string[]
  tempoGeracao?: number // em ms
}

export interface ErroGeracao {
  codigo: string
  mensagem: string
  campo?: string
  dados?: any
}

// ========== CONSTANTES E CONFIGURAÇÕES ==========

export const TIPOS_RELATORIO_CONFIG = {
  execucao: {
    nome: 'Relatório de Execução',
    descricao: 'Acompanhamento detalhado da execução física e financeira',
    icone: 'FileText',
    cor: 'blue',
  },
  desempenho: {
    nome: 'Relatório de Desempenho',
    descricao: 'Avaliação de desempenho com base em indicadores e metas',
    icone: 'TrendingUp',
    cor: 'green',
  },
  formalizacao: {
    nome: 'Checklist de Formalização',
    descricao: 'Verificação de documentos e procedimentos de formalização',
    icone: 'FileCheck',
    cor: 'purple',
  },
  prorrogacao: {
    nome: 'Checklist de Prorrogação',
    descricao: 'Requisitos e documentos necessários para prorrogação',
    icone: 'Clock',
    cor: 'orange',
  },
  encerramento: {
    nome: 'Checklist de Encerramento',
    descricao: 'Procedimentos necessários para encerramento do contrato',
    icone: 'CheckCircle',
    cor: 'red',
  },
} as const

export const SECOES_RELATORIO_EXECUCAO = {
  identificacao: 'Identificação do Contrato',
  financeiro: 'Informações Financeiras',
  cronograma: 'Cronograma de Vigência',
  empenhos: 'Controle de Empenhos',
  alteracoes: 'Alterações Contratuais',
  documentos: 'Documentação',
  responsaveis: 'Unidades e Responsáveis',
} as const
