/**
 * ==========================================
 * SERVIÇO DE GERAÇÃO DE PDF
 * ==========================================
 * Orquestra a geração completa de relatórios em PDF
 */

import React from 'react'
import { pdf } from '@react-pdf/renderer'

import type {
  DadosRelatorio,
  TipoRelatorio,
  ContratoRelatorio,
  ConfiguracaoPersonalizacao,
} from '../types/relatorio'
import { GerarRelatorioExecucao } from '../lib/pdf/templates/execucao-template'
import { gerarTodosGraficosExecucao } from '../lib/pdf/gerar-graficos'
import { gerarNomeArquivo, gerarMetadados } from '../lib/pdf/pdf-utils'
import { salvarNoHistorico } from './historico-service'
import { CONFIGURACAO_GERACAO } from '../config/relatorios-config'
import { getUsuario } from '@/lib/auth/auth'

// ========== TIPOS ==========

export interface OpcoesBaixarPDF {
  nomeArquivo?: string
  salvarHistorico?: boolean
}

export interface ProgressoGeracao {
  etapa:
    | 'validando'
    | 'buscando-dados'
    | 'gerando-graficos'
    | 'montando-pdf'
    | 'salvando'
    | 'concluido'
  progresso: number // 0-100
  mensagem: string
}

export type CallbackProgresso = (progresso: ProgressoGeracao) => void

// ========== VALIDAÇÃO ==========

/**
 * Valida se os dados estão completos para geração
 */
const validarDadosRelatorio = (dados: DadosRelatorio): void => {
  if (!dados.tipo) {
    throw new Error('Tipo de relatório não especificado')
  }

  if (!dados.contratos || dados.contratos.length === 0) {
    throw new Error('Nenhum contrato selecionado')
  }

  if (dados.contratos.length > CONFIGURACAO_GERACAO.maxContratosSimultaneos) {
    throw new Error(
      `Máximo de ${CONFIGURACAO_GERACAO.maxContratosSimultaneos} contratos permitidos`,
    )
  }

  // Valida campos obrigatórios do contrato
  dados.contratos.forEach((contrato, index) => {
    if (!contrato.numeroContrato) {
      throw new Error(`Contrato ${index + 1}: número não informado`)
    }
    if (!contrato.objeto) {
      throw new Error(`Contrato ${index + 1}: objeto não informado`)
    }
    if (!contrato.valores || typeof contrato.valores.global !== 'number') {
      throw new Error(`Contrato ${index + 1}: valores inválidos`)
    }
  })
}

// ========== GERAÇÃO DE GRÁFICOS ==========

/**
 * Gera gráficos para os contratos selecionados
 */
const gerarGraficosRelatorio = async (
  tipo: TipoRelatorio,
  contratos: ContratoRelatorio[],
  callback?: CallbackProgresso,
): Promise<Record<string, any>> => {
  if (callback) {
    callback({
      etapa: 'gerando-graficos',
      progresso: 40,
      mensagem: 'Gerando gráficos...',
    })
  }

  const graficos: Record<string, any> = {}

  // Por enquanto, apenas relatório de execução tem gráficos
  if (tipo === 'execucao' && contratos.length > 0) {
    try {
      const graficosContrato = await gerarTodosGraficosExecucao(contratos[0])
      Object.assign(graficos, graficosContrato)
    } catch (erro) {
      console.error('Erro ao gerar gráficos:', erro)
      // Continua sem gráficos ao invés de falhar
    }
  }

  return graficos
}

// ========== SELEÇÃO DE TEMPLATE ==========

/**
 * Retorna o componente de template apropriado para o tipo de relatório
 */
const selecionarTemplate = (tipo: TipoRelatorio): React.FC<any> => {
  switch (tipo) {
    case 'execucao':
      return GerarRelatorioExecucao
    case 'desempenho':
      // TODO: Implementar template de desempenho
      throw new Error('Template de Desempenho ainda não implementado')
    case 'formalizacao':
    case 'prorrogacao':
    case 'encerramento':
      // TODO: Implementar templates de checklist
      throw new Error('Templates de Checklist ainda não implementados')
    default:
      throw new Error(`Tipo de relatório desconhecido: ${tipo}`)
  }
}

// ========== GERAÇÃO DO PDF ==========

/**
 * Gera documento PDF a partir dos dados e template
 */
const gerarDocumentoPDF = async (
  dados: DadosRelatorio,
  callback?: CallbackProgresso,
): Promise<Blob> => {
  if (callback) {
    callback({
      etapa: 'montando-pdf',
      progresso: 70,
      mensagem: 'Montando documento PDF...',
    })
  }

  try {
    console.log('📄 Iniciando geração de PDF com dados:', {
      tipo: dados.tipo,
      quantidadeContratos: dados.contratos.length,
      contratos: dados.contratos.map((c) => ({
        numero: c.numeroContrato,
        contratada: c.contratada?.razaoSocial,
      })),
    })

    // Seleciona template apropriado
    const TemplateComponent = selecionarTemplate(dados.tipo)

    // Obter usuário logado
    const usuarioLogado = getUsuario()
    const emitidoPor = usuarioLogado?.nomeCompleto || 'Sistema CAC'

    console.log('👤 Emitido por:', emitidoPor)

    // Gera o documento React-PDF com dados do emissor
    const documento = React.createElement(TemplateComponent, {
      dados,
      emitidoPor,
    })

    console.log('🔄 Convertendo documento para Blob...')

    // Converte para Blob
    const pdfBlob = await pdf(documento).toBlob()

    console.log('✅ PDF gerado com sucesso! Tamanho:', pdfBlob.size, 'bytes')

    return pdfBlob
  } catch (erro) {
    console.error('❌ Erro ao gerar documento PDF:', erro)
    console.error('Stack trace:', erro instanceof Error ? erro.stack : 'N/A')
    throw new Error('Falha ao gerar documento PDF: ' + (erro instanceof Error ? erro.message : 'Erro desconhecido'))
  }
}

// ========== DOWNLOAD DO PDF ==========

/**
 * Faz download do PDF no navegador
 */
const baixarPDF = (blob: Blob, nomeArquivo: string): void => {
  try {
    console.log('📥 Iniciando download do PDF:', {
      nomeArquivo,
      tamanhoBlob: blob.size,
      tipoBlob: blob.type,
    })

    if (!blob || blob.size === 0) {
      throw new Error('Blob do PDF está vazio ou inválido')
    }

    const url = URL.createObjectURL(blob)
    console.log('🔗 URL criada:', url)

    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link) // Adicionar ao DOM para compatibilidade

    console.log('🖱️ Disparando clique para download...')
    link.click()

    // Remover do DOM e limpar URL
    document.body.removeChild(link)
    setTimeout(() => {
      URL.revokeObjectURL(url)
      console.log('✅ Download concluído e URL limpa')
    }, 100)
  } catch (erro) {
    console.error('❌ Erro ao fazer download do PDF:', erro)
    throw new Error('Falha ao baixar PDF: ' + (erro instanceof Error ? erro.message : 'Erro desconhecido'))
  }
}

// ========== API PÚBLICA ==========

/**
 * Gera relatório completo em PDF
 */
export const gerarRelatorioPDF = async (
  dados: DadosRelatorio,
  opcoes: OpcoesBaixarPDF = {},
  callback?: CallbackProgresso,
): Promise<Blob> => {
  const {
    nomeArquivo = gerarNomeArquivo(dados.tipo, dados.contratos[0]?.numeroContrato),
    salvarHistorico = true,
  } = opcoes

  try {
    // Etapa 1: Validação
    if (callback) {
      callback({
        etapa: 'validando',
        progresso: 10,
        mensagem: 'Validando dados...',
      })
    }
    validarDadosRelatorio(dados)

    // Etapa 2: Buscando dados (já fornecidos)
    if (callback) {
      callback({
        etapa: 'buscando-dados',
        progresso: 20,
        mensagem: 'Preparando dados...',
      })
    }

    // Etapa 3: Gerando gráficos (apenas para relatório individual)
    let graficos = {}
    if (dados.contratos.length === 1) {
      graficos = await gerarGraficosRelatorio(
        dados.tipo,
        dados.contratos,
        callback,
      )
    } else {
      // Pular geração de gráficos para relatórios consolidados
      if (callback) {
        callback({
          etapa: 'gerando-graficos',
          progresso: 40,
          mensagem: 'Pulando gráficos (relatório consolidado)...',
        })
      }
    }
    dados.graficos = graficos

    // Etapa 4: Montando PDF
    const pdfBlob = await gerarDocumentoPDF(dados, callback)

    // Etapa 5: Salvando no histórico
    if (salvarHistorico) {
      if (callback) {
        callback({
          etapa: 'salvando',
          progresso: 90,
          mensagem: 'Salvando no histórico...',
        })
      }

      const usuario = getUsuario()
      await salvarNoHistorico({
        tipo: dados.tipo,
        nomeArquivo,
        dataGeracao: new Date().toISOString(),
        parametros: dados.configuracao || {},
        contratoIds: dados.contratos.map((c) => c.id),
        numerosContratos: dados.contratos.map((c) => c.numeroContrato),
        quantidadeContratos: dados.contratos.length,
        tamanhoBytes: pdfBlob.size,
        blobData: pdfBlob,
        usuarioId: usuario?.id || 'sistema',
        usuarioNome: usuario?.nomeCompleto || 'Sistema CAC',
      })
    }

    // Concluído
    if (callback) {
      callback({
        etapa: 'concluido',
        progresso: 100,
        mensagem: 'Relatório gerado com sucesso!',
      })
    }

    return pdfBlob
  } catch (erro) {
    console.error('Erro ao gerar relatório PDF:', erro)
    throw erro
  }
}

/**
 * Gera e baixa relatório PDF
 */
export const gerarEBaixarRelatorioPDF = async (
  dados: DadosRelatorio,
  opcoes: OpcoesBaixarPDF = {},
  callback?: CallbackProgresso,
): Promise<void> => {
  const nomeArquivo =
    opcoes.nomeArquivo ||
    gerarNomeArquivo(dados.tipo, dados.contratos[0]?.numeroContrato)

  const pdfBlob = await gerarRelatorioPDF(dados, opcoes, callback)
  baixarPDF(pdfBlob, nomeArquivo)
}

/**
 * Gera preview do PDF (retorna URL temporária)
 */
export const gerarPreviewPDF = async (
  dados: DadosRelatorio,
  callback?: CallbackProgresso,
): Promise<string> => {
  const pdfBlob = await gerarRelatorioPDF(
    dados,
    { salvarHistorico: false },
    callback,
  )
  return URL.createObjectURL(pdfBlob)
}

/**
 * Valida se um relatório pode ser gerado
 */
export const validarRelatorio = (dados: Partial<DadosRelatorio>): {
  valido: boolean
  erros: string[]
} => {
  const erros: string[] = []

  try {
    validarDadosRelatorio(dados as DadosRelatorio)
    return { valido: true, erros: [] }
  } catch (erro) {
    if (erro instanceof Error) {
      erros.push(erro.message)
    }
    return { valido: false, erros }
  }
}

/**
 * Estima tamanho aproximado do PDF antes de gerar
 */
export const estimarTamanhoPDF = (dados: DadosRelatorio): number => {
  // Estimativa baseada em:
  // - Base: 50KB por página
  // - Gráficos: 200KB cada
  // - Tabelas: 10KB por 10 linhas
  // - Múltiplos contratos: multiplicador

  let tamanhoEstimado = 150 * 1024 // 150KB base (3 páginas)

  // Gráficos
  if (dados.graficos) {
    const numGraficos = Object.keys(dados.graficos).length
    tamanhoEstimado += numGraficos * 200 * 1024
  }

  // Empenhos
  const totalEmpenhos = dados.contratos.reduce(
    (sum, c) => sum + (c.empenhos?.length || 0),
    0,
  )
  tamanhoEstimado += Math.ceil(totalEmpenhos / 10) * 10 * 1024

  // Alterações
  const totalAlteracoes = dados.contratos.reduce(
    (sum, c) => sum + (c.alteracoes?.length || 0),
    0,
  )
  tamanhoEstimado += Math.ceil(totalAlteracoes / 10) * 10 * 1024

  // Múltiplos contratos
  if (dados.contratos.length > 1) {
    tamanhoEstimado *= dados.contratos.length
  }

  return Math.ceil(tamanhoEstimado)
}
