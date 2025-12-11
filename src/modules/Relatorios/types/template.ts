/**
 * ==========================================
 * TIPAGEM DE TEMPLATES DE RELATÓRIOS
 * ==========================================
 * Tipos para personalização e templates salvos
 */

import type { TipoRelatorio } from './relatorio'

// ========== TEMPLATE DE RELATÓRIO ==========

export interface TemplateRelatorio {
  id: string
  nome: string
  descricao?: string
  tipoRelatorio: TipoRelatorio
  camposSelecionados: string[]
  ordenacaoCampos: Record<string, number>
  secoesSelecionadas?: string[]
  ordenacaoSecoes?: Record<string, number>
  estiloPersonalizado?: EstiloRelatorio
  configuracaoGraficos?: ConfiguracaoGraficosTemplate
  dataCriacao: string
  dataAtualizacao: string
  usuarioId: string
  usuarioNome?: string
  padrao: boolean // Se é template padrão do sistema
  compartilhado: boolean // Se pode ser usado por outros usuários
  favoritado?: boolean
}

// ========== ESTILO PERSONALIZADO ==========

export interface EstiloRelatorio {
  cores?: CoresTemplate
  tipografia?: TipografiaTemplate
  espacamento?: EspacamentoTemplate
  layout?: LayoutTemplate
}

export interface CoresTemplate {
  primaria?: string // Hex color
  secundaria?: string
  destaque?: string
  texto?: string
  textoSecundario?: string
  fundo?: string
  fundoSecundario?: string
  borda?: string
}

export interface TipografiaTemplate {
  fonteTitulo?: FonteTemplate
  fonteSubtitulo?: FonteTemplate
  fonteCorpo?: FonteTemplate
  fonteTabelaCabecalho?: FonteTemplate
  fonteTabelaCorpo?: FonteTemplate
}

export interface FonteTemplate {
  familia?: string // 'Helvetica', 'Times-Roman', etc.
  tamanho?: number // em pontos
  peso?: 'normal' | 'bold'
  estilo?: 'normal' | 'italic'
  cor?: string
}

export interface EspacamentoTemplate {
  margem?: MargemTemplate
  espacamentoSecao?: number // em pontos
  espacamentoElemento?: number
  alturaLinha?: number // multiplicador (1.5 = 150%)
}

export interface MargemTemplate {
  superior?: number
  inferior?: number
  esquerda?: number
  direita?: number
}

export interface LayoutTemplate {
  orientacao?: 'retrato' | 'paisagem'
  tamanho?: 'A4' | 'carta' | 'oficio'
  colunas?: number
  mostrarCabecalho?: boolean
  mostrarRodape?: boolean
  mostrarNumeracaoPagina?: boolean
  mostrarDataGeracao?: boolean
  mostrarLogo?: boolean
  logoUrl?: string
}

// ========== CONFIGURAÇÃO DE GRÁFICOS ==========

export interface ConfiguracaoGraficosTemplate {
  incluirGraficos: boolean
  graficosAtivos: string[] // IDs dos gráficos a incluir
  posicaoGraficos?: 'inline' | 'final' // Inline com seção ou todos no final
  tamanhoGraficos?: 'pequeno' | 'medio' | 'grande'
  resolucaoGraficos?: number // DPI (150, 300)
  coresPersonalizadas?: string[]
}

// ========== GESTÃO DE TEMPLATES ==========

export interface FiltrosTemplate {
  tipoRelatorio?: TipoRelatorio
  usuarioId?: string
  padrao?: boolean
  compartilhado?: boolean
  favoritado?: boolean
  termoPesquisa?: string
}

export interface ResultadoOperacaoTemplate {
  sucesso: boolean
  mensagem: string
  template?: TemplateRelatorio
  erro?: string
}

// ========== TEMPLATES PADRÃO DO SISTEMA ==========

export const TEMPLATE_PADRAO_EXECUCAO: Omit<
  TemplateRelatorio,
  'id' | 'usuarioId' | 'dataCriacao' | 'dataAtualizacao'
> = {
  nome: 'Execução Completo (Padrão)',
  descricao: 'Template padrão com todas as seções e campos',
  tipoRelatorio: 'execucao',
  camposSelecionados: [
    'numeroContrato',
    'processoSei',
    'objeto',
    'contratada',
    'valorGlobal',
    'valorEmpenhado',
    'saldo',
    'percentualExecutado',
    'vigenciaInicial',
    'vigenciaFinal',
    'prazoMeses',
    'diasRestantes',
    'empenhos',
    'alteracoes',
    'documentos',
    'unidades',
    'responsaveis',
  ],
  ordenacaoCampos: {
    numeroContrato: 1,
    processoSei: 2,
    objeto: 3,
    contratada: 4,
    valorGlobal: 5,
    valorEmpenhado: 6,
    saldo: 7,
    percentualExecutado: 8,
    vigenciaInicial: 9,
    vigenciaFinal: 10,
    prazoMeses: 11,
    diasRestantes: 12,
    empenhos: 13,
    alteracoes: 14,
    documentos: 15,
    unidades: 16,
    responsaveis: 17,
  },
  padrao: true,
  compartilhado: true,
}

export const TEMPLATE_PADRAO_DESEMPENHO: Omit<
  TemplateRelatorio,
  'id' | 'usuarioId' | 'dataCriacao' | 'dataAtualizacao'
> = {
  nome: 'Desempenho Completo (Padrão)',
  descricao: 'Template padrão para relatório de desempenho',
  tipoRelatorio: 'desempenho',
  camposSelecionados: [
    'numeroContrato',
    'objeto',
    'contratada',
    'indicadoresFinanceiros',
    'indicadoresTemporais',
    'velocidadeExecucao',
    'projecoes',
    'alertas',
  ],
  ordenacaoCampos: {
    numeroContrato: 1,
    objeto: 2,
    contratada: 3,
    indicadoresFinanceiros: 4,
    indicadoresTemporais: 5,
    velocidadeExecucao: 6,
    projecoes: 7,
    alertas: 8,
  },
  configuracaoGraficos: {
    incluirGraficos: true,
    graficosAtivos: ['execucaoFinanceira', 'execucaoTemporal', 'velocidade'],
    posicaoGraficos: 'inline',
    tamanhoGraficos: 'medio',
    resolucaoGraficos: 150,
  },
  padrao: true,
  compartilhado: true,
}

export const TEMPLATE_PADRAO_CHECKLIST: Omit<
  TemplateRelatorio,
  'id' | 'usuarioId' | 'dataCriacao' | 'dataAtualizacao'
> = {
  nome: 'Checklist Completo (Padrão)',
  descricao: 'Template padrão para checklists contratuais',
  tipoRelatorio: 'formalizacao',
  camposSelecionados: [
    'numeroContrato',
    'objeto',
    'contratada',
    'documentosObrigatorios',
    'statusDocumentos',
    'pendencias',
    'percentualConclusao',
  ],
  ordenacaoCampos: {
    numeroContrato: 1,
    objeto: 2,
    contratada: 3,
    documentosObrigatorios: 4,
    statusDocumentos: 5,
    pendencias: 6,
    percentualConclusao: 7,
  },
  padrao: true,
  compartilhado: true,
}

// ========== CONSTANTES DE ESTILO ==========

export const CORES_PADRAO: CoresTemplate = {
  primaria: '#2563eb', // Blue-600
  secundaria: '#64748b', // Slate-500
  destaque: '#f59e0b', // Amber-500
  texto: '#1e293b', // Slate-800
  textoSecundario: '#64748b', // Slate-500
  fundo: '#ffffff',
  fundoSecundario: '#f8fafc', // Slate-50
  borda: '#e2e8f0', // Slate-200
}

export const FONTES_DISPONIVEIS = [
  { valor: 'Helvetica', nome: 'Helvetica' },
  { valor: 'Times-Roman', nome: 'Times New Roman' },
  { valor: 'Courier', nome: 'Courier' },
] as const

export const TAMANHOS_PAGINA = [
  { valor: 'A4', nome: 'A4 (210 x 297 mm)' },
  { valor: 'carta', nome: 'Carta (216 x 279 mm)' },
  { valor: 'oficio', nome: 'Ofício (216 x 330 mm)' },
] as const
