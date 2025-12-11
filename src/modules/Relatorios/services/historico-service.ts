/**
 * ==========================================
 * SERVICE DE HISTÓRICO DE RELATÓRIOS
 * ==========================================
 * Gerenciamento de histórico usando IndexedDB via LocalForage
 */

import localforage from 'localforage'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type {
  RelatorioHistorico,
  RelatorioHistoricoListItem,
  FiltrosHistorico,
  EstatisticasHistorico,
  ResultadoOperacaoHistorico,
  OrdenacaoHistorico,
  CONFIGURACAO_HISTORICO_PADRAO,
} from '../types/historico'
import type { TipoRelatorio } from '../types/relatorio'
import { TIPOS_RELATORIO_CONFIG } from '../types/relatorio'

// ========== CONFIGURAÇÃO DO INDEXEDDB ==========

const historicoDB = localforage.createInstance({
  name: 'cac-relatorios',
  storeName: 'historico',
  description: 'Histórico de relatórios gerados',
})

// ========== CONSTANTES ==========

const LIMITE_MAXIMO_RELATORIOS = 50
const TAMANHO_MAXIMO_TOTAL_BYTES = 500 * 1024 * 1024 // 500 MB

// ========== FUNÇÕES PRINCIPAIS ==========

/**
 * Salva um relatório no histórico
 */
export const salvarNoHistorico = async (
  relatorio: Omit<RelatorioHistorico, 'id'> & { id?: string },
): Promise<ResultadoOperacaoHistorico> => {
  try {
    // Gerar ID se não fornecido
    const id = relatorio.id || `relatorio-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const relatorioCompleto: RelatorioHistorico = {
      ...relatorio,
      id,
    } as RelatorioHistorico

    // Verificar e limpar histórico se necessário
    await verificarLimitesHistorico()

    // Salvar relatório
    await historicoDB.setItem(id, relatorioCompleto)

    return {
      sucesso: true,
      mensagem: 'Relatório salvo no histórico com sucesso',
      item: relatorioCompleto,
    }
  } catch (erro) {
    console.error('Erro ao salvar no histórico:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao salvar no histórico',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Lista todos os relatórios do histórico com filtros
 */
export const listarHistorico = async (
  filtros?: FiltrosHistorico,
): Promise<RelatorioHistoricoListItem[]> => {
  try {
    const keys = await historicoDB.keys()
    const relatorios = await Promise.all(
      keys.map((key) => historicoDB.getItem<RelatorioHistorico>(key)),
    )

    // Filtrar nulls e aplicar filtros
    let relatoriosFiltrados = relatorios.filter(
      (r): r is RelatorioHistorico => r !== null,
    )

    // Aplicar filtros
    if (filtros) {
      relatoriosFiltrados = aplicarFiltros(relatoriosFiltrados, filtros)
    }

    // Ordenar
    const ordenacao = filtros?.ordenacao || 'data_desc'
    relatoriosFiltrados = ordenarRelatorios(relatoriosFiltrados, ordenacao)

    // Aplicar limite
    if (filtros?.limite) {
      relatoriosFiltrados = relatoriosFiltrados.slice(0, filtros.limite)
    }

    // Converter para lista de exibição
    return relatoriosFiltrados.map(converterParaListItem)
  } catch (erro) {
    console.error('Erro ao listar histórico:', erro)
    return []
  }
}

/**
 * Busca um relatório específico por ID
 */
export const buscarRelatorio = async (
  id: string,
): Promise<RelatorioHistorico | null> => {
  try {
    return await historicoDB.getItem<RelatorioHistorico>(id)
  } catch (erro) {
    console.error('Erro ao buscar relatório:', erro)
    return null
  }
}

/**
 * Baixa um relatório do histórico
 */
export const baixarDoHistorico = async (
  id: string,
): Promise<ResultadoOperacaoHistorico> => {
  try {
    const relatorio = await historicoDB.getItem<RelatorioHistorico>(id)

    if (!relatorio) {
      return {
        sucesso: false,
        mensagem: 'Relatório não encontrado',
      }
    }

    if (!relatorio.blobData) {
      return {
        sucesso: false,
        mensagem: 'Arquivo do relatório não disponível',
      }
    }

    // Criar URL e fazer download
    const url = URL.createObjectURL(relatorio.blobData)
    const link = document.createElement('a')
    link.href = url
    link.download = relatorio.nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return {
      sucesso: true,
      mensagem: 'Download iniciado com sucesso',
      item: relatorio,
    }
  } catch (erro) {
    console.error('Erro ao baixar relatório:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao baixar relatório',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Exclui um relatório do histórico
 */
export const excluirDoHistorico = async (
  id: string,
): Promise<ResultadoOperacaoHistorico> => {
  try {
    const relatorio = await historicoDB.getItem<RelatorioHistorico>(id)

    if (!relatorio) {
      return {
        sucesso: false,
        mensagem: 'Relatório não encontrado',
      }
    }

    await historicoDB.removeItem(id)

    return {
      sucesso: true,
      mensagem: 'Relatório excluído com sucesso',
    }
  } catch (erro) {
    console.error('Erro ao excluir relatório:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao excluir relatório',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Limpa todo o histórico
 */
export const limparHistorico = async (): Promise<ResultadoOperacaoHistorico> => {
  try {
    await historicoDB.clear()

    return {
      sucesso: true,
      mensagem: 'Histórico limpo com sucesso',
    }
  } catch (erro) {
    console.error('Erro ao limpar histórico:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao limpar histórico',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Obtém estatísticas do histórico
 */
export const obterEstatisticasHistorico =
  async (): Promise<EstatisticasHistorico> => {
    try {
      const relatorios = await listarTodosRelatorios()

      const totalRelatorios = relatorios.length
      const totalContratos = new Set(
        relatorios.flatMap((r) => r.contratoIds),
      ).size
      const tamanhoTotalBytes = relatorios.reduce(
        (sum, r) => sum + r.tamanhoBytes,
        0,
      )

      const relatoriosPorTipo = relatorios.reduce(
        (acc, r) => {
          acc[r.tipo] = (acc[r.tipo] || 0) + 1
          return acc
        },
        {} as Record<TipoRelatorio, number>,
      )

      // Converter para array para facilitar iteração
      const porTipo = Object.entries(relatoriosPorTipo).map(([tipo, quantidade]) => ({
        tipo: tipo as TipoRelatorio,
        quantidade,
      }))

      const datas = relatorios.map((r) => new Date(r.dataGeracao).getTime())
      const ultimaGeracao =
        datas.length > 0 ? new Date(Math.max(...datas)).toISOString() : undefined
      const primeiraGeracao =
        datas.length > 0 ? new Date(Math.min(...datas)).toISOString() : undefined

      return {
        totalRelatorios,
        totalContratos,
        tamanhoTotalBytes,
        tamanhoTotalFormatado: formatarTamanho(tamanhoTotalBytes),
        relatoriosPorTipo,
        porTipo,
        ultimaGeracao,
        primeiraGeracao,
        mediaTamanhoBytes:
          totalRelatorios > 0 ? tamanhoTotalBytes / totalRelatorios : 0,
      }
    } catch (erro) {
      console.error('Erro ao obter estatísticas:', erro)
      return {
        totalRelatorios: 0,
        totalContratos: 0,
        tamanhoTotalBytes: 0,
        tamanhoTotalFormatado: '0 B',
        relatoriosPorTipo: {} as Record<TipoRelatorio, number>,
        porTipo: [],
        mediaTamanhoBytes: 0,
      }
    }
  }

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Verifica limites e remove relatórios antigos se necessário
 */
const verificarLimitesHistorico = async (): Promise<void> => {
  const relatorios = await listarTodosRelatorios()

  // Verificar limite de quantidade
  if (relatorios.length >= LIMITE_MAXIMO_RELATORIOS) {
    // Ordenar por data (mais antigo primeiro)
    const ordenados = relatorios.sort(
      (a, b) =>
        new Date(a.dataGeracao).getTime() - new Date(b.dataGeracao).getTime(),
    )

    // Remover os mais antigos
    const quantidadeRemover = relatorios.length - LIMITE_MAXIMO_RELATORIOS + 1
    for (let i = 0; i < quantidadeRemover; i++) {
      await historicoDB.removeItem(ordenados[i].id)
    }
  }

  // Verificar limite de tamanho total
  const tamanhoTotal = relatorios.reduce((sum, r) => sum + r.tamanhoBytes, 0)
  if (tamanhoTotal >= TAMANHO_MAXIMO_TOTAL_BYTES) {
    // Remover os maiores arquivos antigos
    const ordenadosPorTamanho = relatorios.sort(
      (a, b) => b.tamanhoBytes - a.tamanhoBytes,
    )

    let tamanhoAtual = tamanhoTotal
    for (const relatorio of ordenadosPorTamanho) {
      if (tamanhoAtual < TAMANHO_MAXIMO_TOTAL_BYTES * 0.8) break
      await historicoDB.removeItem(relatorio.id)
      tamanhoAtual -= relatorio.tamanhoBytes
    }
  }
}

/**
 * Lista todos os relatórios sem filtros
 */
const listarTodosRelatorios = async (): Promise<RelatorioHistorico[]> => {
  const keys = await historicoDB.keys()
  const relatorios = await Promise.all(
    keys.map((key) => historicoDB.getItem<RelatorioHistorico>(key)),
  )
  return relatorios.filter((r): r is RelatorioHistorico => r !== null)
}

/**
 * Aplica filtros aos relatórios
 */
const aplicarFiltros = (
  relatorios: RelatorioHistorico[],
  filtros: FiltrosHistorico,
): RelatorioHistorico[] => {
  let resultado = relatorios

  // Filtro por tipo
  if (filtros.tipo && filtros.tipo.length > 0) {
    resultado = resultado.filter((r) => filtros.tipo!.includes(r.tipo))
  }

  // Filtro por data inicial
  if (filtros.dataInicial) {
    const dataInicial = new Date(filtros.dataInicial).getTime()
    resultado = resultado.filter(
      (r) => new Date(r.dataGeracao).getTime() >= dataInicial,
    )
  }

  // Filtro por data final
  if (filtros.dataFinal) {
    const dataFinal = new Date(filtros.dataFinal).getTime()
    resultado = resultado.filter(
      (r) => new Date(r.dataGeracao).getTime() <= dataFinal,
    )
  }

  // Filtro por termo de pesquisa
  if (filtros.termoPesquisa) {
    const termo = filtros.termoPesquisa.toLowerCase()
    resultado = resultado.filter(
      (r) =>
        r.nomeArquivo.toLowerCase().includes(termo) ||
        r.numerosContratos.some((num) => num.toLowerCase().includes(termo)) ||
        r.observacoes?.toLowerCase().includes(termo),
    )
  }

  return resultado
}

/**
 * Ordena relatórios
 */
const ordenarRelatorios = (
  relatorios: RelatorioHistorico[],
  ordenacao: OrdenacaoHistorico,
): RelatorioHistorico[] => {
  const copia = [...relatorios]

  switch (ordenacao) {
    case 'data_desc':
      return copia.sort(
        (a, b) =>
          new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime(),
      )
    case 'data_asc':
      return copia.sort(
        (a, b) =>
          new Date(a.dataGeracao).getTime() - new Date(b.dataGeracao).getTime(),
      )
    case 'tamanho_desc':
      return copia.sort((a, b) => b.tamanhoBytes - a.tamanhoBytes)
    case 'tamanho_asc':
      return copia.sort((a, b) => a.tamanhoBytes - b.tamanhoBytes)
    case 'tipo_asc':
      return copia.sort((a, b) => a.tipo.localeCompare(b.tipo))
    case 'contratos_desc':
      return copia.sort((a, b) => b.quantidadeContratos - a.quantidadeContratos)
    default:
      return copia
  }
}

/**
 * Converte relatório para item de lista
 */
const converterParaListItem = (
  relatorio: RelatorioHistorico,
): RelatorioHistoricoListItem => {
  const config = TIPOS_RELATORIO_CONFIG[relatorio.tipo]

  return {
    id: relatorio.id,
    tipo: relatorio.tipo,
    tipoNome: config.nome,
    nomeArquivo: relatorio.nomeArquivo,
    dataGeracao: relatorio.dataGeracao,
    dataGeracaoFormatada: formatDistanceToNow(new Date(relatorio.dataGeracao), {
      addSuffix: true,
      locale: ptBR,
    }),
    quantidadeContratos: relatorio.quantidadeContratos,
    tamanhoFormatado: formatarTamanho(relatorio.tamanhoBytes),
    contratosSumario: formatarContratosSumario(relatorio.numerosContratos),
    podeReabrir: !!relatorio.blobData,
  }
}

/**
 * Formata tamanho em bytes para string legível
 */
const formatarTamanho = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * Formata lista de contratos para sumário
 */
const formatarContratosSumario = (numeros: string[]): string => {
  if (numeros.length === 0) return 'Nenhum contrato'
  if (numeros.length === 1) return numeros[0]
  if (numeros.length <= 3) return numeros.join(', ')

  return `${numeros.slice(0, 3).join(', ')}... (+${numeros.length - 3})`
}
