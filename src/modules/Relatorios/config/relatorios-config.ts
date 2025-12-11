/**
 * ==========================================
 * CONFIGURAÇÕES DO MÓDULO DE RELATÓRIOS
 * ==========================================
 * Configurações centralizadas para geração de relatórios
 */

import {
  FileText,
  TrendingUp,
  FileCheck,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react'
import type { TipoRelatorio, CampoRelatorio } from '../types/relatorio'
import type { LucideIcon } from 'lucide-react'

// ========== CONFIGURAÇÃO DOS TIPOS DE RELATÓRIO ==========

export interface ConfiguracaoTipoRelatorio {
  tipo: TipoRelatorio
  nome: string
  descricao: string
  icone: LucideIcon
  cor: string
  corHex: string
  habilitado: boolean
  requireContratos: boolean
  maxContratos: number
  temGraficos: boolean
  temPersonalizacao: boolean
}

export const CONFIGURACAO_TIPOS_RELATORIO: Record<
  TipoRelatorio,
  ConfiguracaoTipoRelatorio
> = {
  execucao: {
    tipo: 'execucao',
    nome: 'Relatório de Execução',
    descricao: 'Acompanhamento detalhado da execução física e financeira do contrato',
    icone: FileText,
    cor: 'blue',
    corHex: '#2a688f', // Azul escuro CAC (Primary)
    habilitado: true,
    requireContratos: true,
    maxContratos: 10,
    temGraficos: true,
    temPersonalizacao: true,
  },
  desempenho: {
    tipo: 'desempenho',
    nome: 'Relatório de Desempenho',
    descricao: 'Avaliação de desempenho com base em indicadores e metas',
    icone: TrendingUp,
    cor: 'green',
    corHex: '#42b9eb', // Azul claro CAC (Secondary)
    habilitado: true,
    requireContratos: true,
    maxContratos: 50,
    temGraficos: true,
    temPersonalizacao: true,
  },
  formalizacao: {
    tipo: 'formalizacao',
    nome: 'Checklist de Formalização',
    descricao: 'Verificação de documentos e procedimentos de formalização',
    icone: FileCheck,
    cor: 'purple',
    corHex: '#5ac8fa', // Azul médio CAC
    habilitado: true,
    requireContratos: true,
    maxContratos: 10,
    temGraficos: false,
    temPersonalizacao: false,
  },
  prorrogacao: {
    tipo: 'prorrogacao',
    nome: 'Checklist de Prorrogação',
    descricao: 'Requisitos e documentos necessários para prorrogação',
    icone: Clock,
    cor: 'orange',
    corHex: '#1c4f6a', // Azul navy CAC
    habilitado: true,
    requireContratos: true,
    maxContratos: 10,
    temGraficos: false,
    temPersonalizacao: false,
  },
  encerramento: {
    tipo: 'encerramento',
    nome: 'Checklist de Encerramento',
    descricao: 'Procedimentos necessários para encerramento do contrato',
    icone: CheckCircle,
    cor: 'red',
    corHex: '#7dd3fc', // Azul sky CAC
    habilitado: true,
    requireContratos: true,
    maxContratos: 10,
    temGraficos: false,
    temPersonalizacao: false,
  },
}

// ========== CONFIGURAÇÃO DE CAMPOS ==========

export const CAMPOS_RELATORIO_EXECUCAO: CampoRelatorio[] = [
  // Identificação
  {
    id: 'numeroContrato',
    nome: 'numeroContrato',
    nomeExibicao: 'Número do Contrato',
    secao: 'identificacao',
    tipo: 'texto',
    obrigatorio: true,
    visivel: true,
    ordem: 1,
  },
  {
    id: 'processoSei',
    nome: 'processoSei',
    nomeExibicao: 'Processo SEI',
    secao: 'identificacao',
    tipo: 'texto',
    obrigatorio: false,
    visivel: true,
    ordem: 2,
  },
  {
    id: 'objeto',
    nome: 'objeto',
    nomeExibicao: 'Objeto do Contrato',
    secao: 'identificacao',
    tipo: 'texto',
    obrigatorio: true,
    visivel: true,
    ordem: 3,
  },
  {
    id: 'contratadaRazaoSocial',
    nome: 'contratada.razaoSocial',
    nomeExibicao: 'Razão Social da Contratada',
    secao: 'identificacao',
    tipo: 'texto',
    obrigatorio: true,
    visivel: true,
    ordem: 4,
  },
  {
    id: 'contratadaCnpj',
    nome: 'contratada.cnpj',
    nomeExibicao: 'CNPJ da Contratada',
    secao: 'identificacao',
    tipo: 'texto',
    obrigatorio: true,
    visivel: true,
    ordem: 5,
    formatacao: 'cnpj',
  },

  // Valores
  {
    id: 'valorGlobal',
    nome: 'valores.global',
    nomeExibicao: 'Valor Global',
    secao: 'financeiro',
    tipo: 'moeda',
    obrigatorio: true,
    visivel: true,
    ordem: 6,
  },
  {
    id: 'valorEmpenhado',
    nome: 'valores.empenhado',
    nomeExibicao: 'Valor Empenhado',
    secao: 'financeiro',
    tipo: 'moeda',
    obrigatorio: true,
    visivel: true,
    ordem: 7,
  },
  {
    id: 'saldoAtual',
    nome: 'valores.saldo',
    nomeExibicao: 'Saldo Atual',
    secao: 'financeiro',
    tipo: 'moeda',
    obrigatorio: true,
    visivel: true,
    ordem: 8,
  },
  {
    id: 'percentualExecutado',
    nome: 'valores.percentualExecutado',
    nomeExibicao: 'Percentual Executado',
    secao: 'financeiro',
    tipo: 'numero',
    obrigatorio: true,
    visivel: true,
    ordem: 9,
    formatacao: 'percentual',
  },

  // Vigência
  {
    id: 'vigenciaInicial',
    nome: 'vigencia.inicial',
    nomeExibicao: 'Vigência Inicial',
    secao: 'cronograma',
    tipo: 'data',
    obrigatorio: true,
    visivel: true,
    ordem: 10,
  },
  {
    id: 'vigenciaFinal',
    nome: 'vigencia.final',
    nomeExibicao: 'Vigência Final',
    secao: 'cronograma',
    tipo: 'data',
    obrigatorio: true,
    visivel: true,
    ordem: 11,
  },
  {
    id: 'prazoMeses',
    nome: 'vigencia.prazoMeses',
    nomeExibicao: 'Prazo (meses)',
    secao: 'cronograma',
    tipo: 'numero',
    obrigatorio: true,
    visivel: true,
    ordem: 12,
  },
  {
    id: 'diasRestantes',
    nome: 'vigencia.diasRestantes',
    nomeExibicao: 'Dias Restantes',
    secao: 'cronograma',
    tipo: 'numero',
    obrigatorio: true,
    visivel: true,
    ordem: 13,
  },

  // Tabelas
  {
    id: 'empenhos',
    nome: 'empenhos',
    nomeExibicao: 'Empenhos',
    secao: 'empenhos',
    tipo: 'tabela',
    obrigatorio: false,
    visivel: true,
    ordem: 14,
  },
  {
    id: 'alteracoes',
    nome: 'alteracoes',
    nomeExibicao: 'Alterações Contratuais',
    secao: 'alteracoes',
    tipo: 'tabela',
    obrigatorio: false,
    visivel: true,
    ordem: 15,
  },
  {
    id: 'documentos',
    nome: 'documentos',
    nomeExibicao: 'Documentos',
    secao: 'documentos',
    tipo: 'tabela',
    obrigatorio: false,
    visivel: true,
    ordem: 16,
  },
]

// ========== CONFIGURAÇÃO DE GRÁFICOS ==========

export interface ConfiguracaoGrafico {
  id: string
  nome: string
  descricao: string
  tipo: 'pizza' | 'barra' | 'linha' | 'area' | 'radar'
  icone: LucideIcon
  aplicavelA: TipoRelatorio[]
  habilitado: boolean
}

export const GRAFICOS_DISPONIVEIS: ConfiguracaoGrafico[] = [
  {
    id: 'execucaoFinanceira',
    nome: 'Execução Financeira',
    descricao: 'Gráfico de pizza mostrando valor empenhado vs saldo',
    tipo: 'pizza',
    icone: PieChart,
    aplicavelA: ['execucao', 'desempenho'],
    habilitado: true,
  },
  {
    id: 'execucaoTemporal',
    nome: 'Execução Temporal',
    descricao: 'Linha do tempo da vigência do contrato',
    tipo: 'barra',
    icone: BarChart3,
    aplicavelA: ['execucao', 'desempenho'],
    habilitado: true,
  },
  {
    id: 'distribuicaoEmpenhos',
    nome: 'Distribuição de Empenhos',
    descricao: 'Gráfico de barras com distribuição dos empenhos ao longo do tempo',
    tipo: 'barra',
    icone: BarChart3,
    aplicavelA: ['execucao'],
    habilitado: true,
  },
  {
    id: 'evolucaoMensal',
    nome: 'Evolução Mensal',
    descricao: 'Gráfico de linha mostrando evolução mensal da execução',
    tipo: 'linha',
    icone: LineChart,
    aplicavelA: ['execucao', 'desempenho'],
    habilitado: true,
  },
]

// ========== CONFIGURAÇÕES DE GERAÇÃO ==========

export const CONFIGURACAO_GERACAO = {
  // Limites
  maxContratosSimultaneos: 10,
  maxTentativasGeracao: 3,
  timeoutGeracao: 30000, // 30 segundos

  // Performance
  resolucaoPadrao: 150, // DPI
  resolucaoImpressao: 300, // DPI
  compressaoImagens: true,
  qualidadeImagens: 0.85,

  // Cache
  cacheDadosMinutos: 10,
  cacheGraficosMinutos: 15,

  // Histórico
  limiteHistorico: 50,
  tamanhoMaximoHistoricoMB: 500,

  // Templates
  permitirExportacao: true,
  permitirImportacao: true,

  // PDF
  margemPadrao: {
    superior: 20,
    inferior: 20,
    esquerda: 20,
    direita: 20,
  },
  orientacaoPadrao: 'retrato' as const,
  tamanhoPaginaPadrao: 'A4' as const,
}

// ========== MENSAGENS E TEXTOS ==========

export const MENSAGENS = {
  geracao: {
    iniciando: 'Iniciando geração do relatório...',
    buscandoDados: 'Buscando dados dos contratos...',
    calculandoIndicadores: 'Calculando indicadores...',
    gerandoGraficos: 'Gerando gráficos...',
    montandoPdf: 'Montando documento PDF...',
    salvandoHistorico: 'Salvando no histórico...',
    sucesso: 'Relatório gerado com sucesso!',
    erro: 'Erro ao gerar relatório',
  },
  validacao: {
    nenhumContratoSelecionado: 'Selecione pelo menos um contrato',
    limiteContratosExcedido: 'Limite de contratos excedido',
    dadosInvalidos: 'Dados inválidos para geração do relatório',
  },
  historico: {
    vazio: 'Nenhum relatório no histórico',
    limparConfirmacao: 'Tem certeza que deseja limpar todo o histórico?',
    excluirConfirmacao: 'Tem certeza que deseja excluir este relatório?',
  },
  templates: {
    vazio: 'Nenhum template encontrado',
    salvoSucesso: 'Template salvo com sucesso',
    excluirConfirmacao: 'Tem certeza que deseja excluir este template?',
  },
}

// ========== OPÇÕES DE EXPORTAÇÃO ==========

export const FORMATOS_EXPORTACAO = [
  {
    valor: 'pdf',
    nome: 'PDF',
    descricao: 'Portable Document Format',
    extensao: '.pdf',
    mimeType: 'application/pdf',
    habilitado: true,
  },
] as const

// ========== CORES DO TEMA ==========

export const CORES_RELATORIO = {
  primaria: '#2563eb', // blue-600
  secundaria: '#64748b', // slate-500
  sucesso: '#22c55e', // green-500
  aviso: '#f59e0b', // amber-500
  erro: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  texto: '#1e293b', // slate-800
  textoSecundario: '#64748b', // slate-500
  fundo: '#ffffff',
  fundoSecundario: '#f8fafc', // slate-50
  borda: '#e2e8f0', // slate-200
}

// ========== HELPERS ==========

export const obterConfiguracaoTipo = (tipo: TipoRelatorio) => {
  return CONFIGURACAO_TIPOS_RELATORIO[tipo]
}

export const obterCamposDisponiveis = (tipo: TipoRelatorio): CampoRelatorio[] => {
  // Por enquanto, apenas relatório de execução tem configuração de campos
  if (tipo === 'execucao') {
    return CAMPOS_RELATORIO_EXECUCAO
  }
  return []
}

export const obterGraficosDisponiveis = (tipo: TipoRelatorio): ConfiguracaoGrafico[] => {
  return GRAFICOS_DISPONIVEIS.filter((g) => g.aplicavelA.includes(tipo))
}
