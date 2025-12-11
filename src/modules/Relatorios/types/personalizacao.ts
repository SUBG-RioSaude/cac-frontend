/**
 * ==========================================
 * TIPAGEM DE PERSONALIZAÇÃO DE RELATÓRIOS
 * ==========================================
 * Tipos para configuração e customização de relatórios
 */

import type { TipoRelatorio, CampoRelatorio, SecaoRelatorio } from './relatorio'
import type { EstiloRelatorio, ConfiguracaoGraficosTemplate } from './template'

// ========== PERSONALIZAÇÃO ATIVA ==========

export interface PersonalizacaoRelatorio {
  id: string
  tipoRelatorio: TipoRelatorio
  camposAtivos: Set<string>
  secoesAtivas: Set<string>
  ordenacaoCampos: Map<string, number>
  ordenacaoSecoes: Map<string, number>
  estilo?: EstiloRelatorio
  graficos?: ConfiguracaoGraficosTemplate
  opcoes?: OpcoesPersonalizacao
}

export interface OpcoesPersonalizacao {
  incluirCapaInicial?: boolean
  incluirIndice?: boolean
  incluirResumoExecutivo?: boolean
  incluirAssinaturas?: boolean
  incluirAnexos?: boolean
  numeroLinhasPorPagina?: number
  quebrarPaginaPorSecao?: boolean
  destacarAlertasImportantes?: boolean
  formatoNumeracao?: 'decimal' | 'romano' | 'alfabetico'
}

// ========== CONFIGURAÇÃO DE CAMPOS ==========

export interface ConfiguracaoCampo {
  campo: CampoRelatorio
  visivel: boolean
  obrigatorio: boolean
  ordem: number
  larguraColuna?: number // Para tabelas
  alinhamento?: 'esquerda' | 'centro' | 'direita'
  formatacao?: FormatacaoCampo
}

export interface FormatacaoCampo {
  tipo: 'texto' | 'numero' | 'moeda' | 'data' | 'percentual' | 'cnpj' | 'cpf'
  opcoes?: FormatacaoOpcoes
}

export interface FormatacaoOpcoes {
  casasDecimais?: number
  prefixo?: string
  sufixo?: string
  separadorMilhar?: string
  separadorDecimal?: string
  formatoData?: string // 'DD/MM/YYYY', 'DD/MM/YY', etc.
  maiuscula?: boolean
  abreviacao?: boolean
}

// ========== CONFIGURAÇÃO DE SEÇÕES ==========

export interface ConfiguracaoSecao {
  secao: SecaoRelatorio
  visivel: boolean
  ordem: number
  titulo?: string // Título customizado
  subtitulo?: string
  icone?: string
  cor?: string
  expandida?: boolean // Se começa expandida
  quebraPagina?: boolean // Se força quebra de página antes
}

// ========== WIZARD DE PERSONALIZAÇÃO ==========

export interface EstadoWizardPersonalizacao {
  etapaAtual: EtapaPersonalizacao
  etapasCompletadas: Set<EtapaPersonalizacao>
  podeAvancar: boolean
  podeVoltar: boolean
  dados: DadosWizardPersonalizacao
}

export type EtapaPersonalizacao =
  | 'campos' // Seleção de campos
  | 'ordem' // Ordenação de campos
  | 'secoes' // Configuração de seções
  | 'estilo' // Personalização de estilo
  | 'graficos' // Configuração de gráficos
  | 'opcoes' // Opções adicionais
  | 'preview' // Preview do resultado

export interface DadosWizardPersonalizacao {
  campos: ConfiguracaoCampo[]
  secoes: ConfiguracaoSecao[]
  estilo: EstiloRelatorio
  graficos: ConfiguracaoGraficosTemplate
  opcoes: OpcoesPersonalizacao
}

// ========== PRESET DE PERSONALIZAÇÃO ==========

export interface PresetPersonalizacao {
  id: string
  nome: string
  descricao?: string
  tipoRelatorio: TipoRelatorio
  categoria: CategoriaPreset
  configuracao: PersonalizacaoRelatorio
  popular: boolean
  recomendado: boolean
}

export type CategoriaPreset =
  | 'minimalista' // Apenas informações essenciais
  | 'completo' // Todas as informações
  | 'executivo' // Resumo para gestão
  | 'tecnico' // Detalhamento técnico
  | 'auditoria' // Formato para auditoria
  | 'personalizado' // Criado pelo usuário

// ========== VALIDAÇÃO DE PERSONALIZAÇÃO ==========

export interface ValidacaoPersonalizacao {
  valida: boolean
  erros: ErroValidacao[]
  avisos: AvisoValidacao[]
}

export interface ErroValidacao {
  campo: string
  mensagem: string
  severidade: 'erro' | 'critico'
}

export interface AvisoValidacao {
  campo: string
  mensagem: string
  tipo: 'info' | 'atencao'
}

// ========== COMPARAÇÃO DE CONFIGURAÇÕES ==========

export interface ComparacaoPersonalizacao {
  camposAdicionados: string[]
  camposRemovidos: string[]
  camposReordenados: string[]
  secoesModificadas: string[]
  estiloAlterado: boolean
  graficosAlterados: boolean
  percentualMudanca: number
}

// ========== EXPORTAÇÃO/IMPORTAÇÃO ==========

export interface ExportacaoPersonalizacao {
  versao: string
  dataExportacao: string
  personalizacao: PersonalizacaoRelatorio
  metadata: {
    usuarioNome?: string
    tipoRelatorioNome: string
    quantidadeCampos: number
    quantidadeSecoes: number
  }
}

export interface ImportacaoPersonalizacao {
  arquivo: File | string
  validar: boolean
  sobrescreverExistente: boolean
}

export interface ResultadoImportacao {
  sucesso: boolean
  personalizacao?: PersonalizacaoRelatorio
  erros?: string[]
  avisos?: string[]
}

// ========== CONSTANTES ==========

export const ETAPAS_WIZARD: Record<EtapaPersonalizacao, string> = {
  campos: 'Selecionar Campos',
  ordem: 'Ordenar Campos',
  secoes: 'Configurar Seções',
  estilo: 'Personalizar Estilo',
  graficos: 'Configurar Gráficos',
  opcoes: 'Opções Adicionais',
  preview: 'Visualizar',
}

export const CATEGORIAS_PRESET: Record<CategoriaPreset, string> = {
  minimalista: 'Minimalista',
  completo: 'Completo',
  executivo: 'Executivo',
  tecnico: 'Técnico',
  auditoria: 'Auditoria',
  personalizado: 'Personalizado',
}

export const FORMATACOES_DISPONIVEIS: FormatacaoCampo[] = [
  {
    tipo: 'moeda',
    opcoes: {
      prefixo: 'R$ ',
      casasDecimais: 2,
      separadorMilhar: '.',
      separadorDecimal: ',',
    },
  },
  {
    tipo: 'data',
    opcoes: {
      formatoData: 'DD/MM/YYYY',
    },
  },
  {
    tipo: 'percentual',
    opcoes: {
      sufixo: '%',
      casasDecimais: 2,
    },
  },
  {
    tipo: 'numero',
    opcoes: {
      casasDecimais: 0,
      separadorMilhar: '.',
    },
  },
]
