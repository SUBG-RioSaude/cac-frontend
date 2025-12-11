/**
 * ==========================================
 * TIPAGEM DE HISTÓRICO DE RELATÓRIOS
 * ==========================================
 * Tipos para armazenamento e consulta de histórico
 */

import type { TipoRelatorio, ParametrosRelatorio } from './relatorio'

// Re-exporta TipoRelatorio para evitar imports circulares
export type { TipoRelatorio }

// ========== HISTÓRICO DE RELATÓRIOS ==========

export interface RelatorioHistorico {
  id: string
  tipo: TipoRelatorio
  nomeArquivo: string
  dataGeracao: string // ISO date-time
  parametros: ParametrosRelatorio
  contratoIds: string[]
  numerosContratos: string[] // Para exibição
  quantidadeContratos: number
  tamanhoBytes: number
  blobData?: Blob // Armazenado no IndexedDB
  usuarioId: string
  usuarioNome?: string
  observacoes?: string
}

export interface RelatorioHistoricoListItem {
  id: string
  tipo: TipoRelatorio
  tipoNome: string
  nomeArquivo: string
  dataGeracao: string
  dataGeracaoFormatada: string // Ex: "há 2 horas"
  quantidadeContratos: number
  tamanhoFormatado: string // Ex: "1.5 MB"
  contratosSumario: string // Ex: "001/2024, 002/2024..."
  podeReabrir: boolean
}

// ========== FILTROS DE HISTÓRICO ==========

export interface FiltrosHistorico {
  tipo?: TipoRelatorio[]
  dataInicial?: string
  dataFinal?: string
  termoPesquisa?: string
  ordenacao?: OrdenacaoHistorico
  limite?: number
}

export type OrdenacaoHistorico =
  | 'data_desc' // Mais recente primeiro (padrão)
  | 'data_asc' // Mais antigo primeiro
  | 'tamanho_desc' // Maior arquivo primeiro
  | 'tamanho_asc' // Menor arquivo primeiro
  | 'tipo_asc' // Por tipo alfabético
  | 'contratos_desc' // Mais contratos primeiro

// ========== ESTATÍSTICAS DO HISTÓRICO ==========

export interface EstatisticasHistorico {
  totalRelatorios: number
  totalContratos: number
  tamanhoTotalBytes: number
  tamanhoTotalFormatado: string
  relatoriosPorTipo: Record<TipoRelatorio, number>
  porTipo: { tipo: TipoRelatorio; quantidade: number }[] // Para iteração
  ultimaGeracao?: string
  primeiraGeracao?: string
  mediaTamanhoBytes: number
}

// ========== CONFIGURAÇÕES DE ARMAZENAMENTO ==========

export interface ConfiguracaoHistorico {
  limiteMaximoRelatorios: number // Padrão: 50
  tamanhoMaximoTotalMB: number // Padrão: 500 MB
  diasRetencao?: number // Opcional: auto-excluir após X dias
  comprimirAcimaDeKB?: number // Opcional: comprimir arquivos grandes
  notificarLimiteProximo: boolean
}

export const CONFIGURACAO_HISTORICO_PADRAO: ConfiguracaoHistorico = {
  limiteMaximoRelatorios: 50,
  tamanhoMaximoTotalMB: 500,
  notificarLimiteProximo: true,
}

// ========== OPERAÇÕES DE HISTÓRICO ==========

export interface ResultadoOperacaoHistorico {
  sucesso: boolean
  mensagem: string
  item?: RelatorioHistorico
  erro?: string
}

export type AcaoHistorico = 'baixar' | 'visualizar' | 'excluir' | 'limpar_tudo'
