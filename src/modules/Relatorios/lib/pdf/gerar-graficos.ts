/**
 * ==========================================
 * GERAÇÃO DE GRÁFICOS COMO IMAGENS
 * ==========================================
 * Converte gráficos React (recharts) em imagens PNG para inclusão em PDFs
 */

import html2canvas from 'html2canvas'

import type { ContratoRelatorio } from '../../types/relatorio'
import { CORES } from './templates/common/estilos'

// ========== CONFIGURAÇÃO ==========

const CONFIGURACAO_CANVAS = {
  scale: 2, // Resolução 2x para melhor qualidade
  backgroundColor: '#ffffff',
  logging: false,
  useCORS: true,
  allowTaint: true,
} as const

// ========== GERAÇÃO DE ELEMENTOS HTML ==========

/**
 * Cria elemento HTML temporário para renderização
 */
const criarElementoTemporario = (width: number, height: number): HTMLDivElement => {
  const elemento = document.createElement('div')
  elemento.style.position = 'fixed'
  elemento.style.left = '-9999px'
  elemento.style.width = `${width}px`
  elemento.style.height = `${height}px`
  elemento.style.backgroundColor = '#ffffff'
  elemento.style.padding = '20px'
  document.body.appendChild(elemento)
  return elemento
}

/**
 * Remove elemento temporário do DOM
 */
const removerElementoTemporario = (elemento: HTMLDivElement) => {
  if (elemento && elemento.parentNode) {
    elemento.parentNode.removeChild(elemento)
  }
}

/**
 * Converte elemento HTML em imagem base64
 */
const converterElementoParaImagem = async (
  elemento: HTMLElement,
): Promise<string> => {
  try {
    const canvas = await html2canvas(elemento, CONFIGURACAO_CANVAS)
    return canvas.toDataURL('image/png')
  } catch (erro) {
    console.error('Erro ao converter elemento para imagem:', erro)
    throw new Error('Falha ao gerar gráfico como imagem')
  }
}

// ========== GRÁFICOS ESPECÍFICOS ==========

/**
 * Gera gráfico de pizza: Execução Financeira
 * Mostra distribuição entre valor empenhado vs saldo
 */
export const gerarGraficoExecucaoFinanceira = async (
  contrato: ContratoRelatorio,
): Promise<string> => {
  const elemento = criarElementoTemporario(600, 400)

  try {
    const valorEmpenhado = contrato.valores.empenhado
    const saldo = contrato.valores.saldo
    const total = valorEmpenhado + saldo
    const percentualEmpenhado = (valorEmpenhado / total) * 100
    const percentualSaldo = (saldo / total) * 100

    // SVG do gráfico de pizza
    elemento.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 20px 0; color: ${CORES.texto}; font-size: 18px;">Execução Financeira</h3>
        <svg width="300" height="300" viewBox="0 0 300 300">
          <!-- Círculo de fundo -->
          <circle cx="150" cy="150" r="100" fill="${CORES.fundoClaro}" />

          <!-- Fatia: Valor Empenhado -->
          <path
            d="M 150 150 L 150 50 A 100 100 0 ${percentualEmpenhado > 50 ? 1 : 0} 1 ${150 + 100 * Math.sin((percentualEmpenhado / 100) * 2 * Math.PI)} ${150 - 100 * Math.cos((percentualEmpenhado / 100) * 2 * Math.PI)} Z"
            fill="${CORES.primaria}"
            stroke="#ffffff"
            stroke-width="2"
          />

          <!-- Fatia: Saldo -->
          <path
            d="M 150 150 L ${150 + 100 * Math.sin((percentualEmpenhado / 100) * 2 * Math.PI)} ${150 - 100 * Math.cos((percentualEmpenhado / 100) * 2 * Math.PI)} A 100 100 0 ${percentualSaldo > 50 ? 1 : 0} 1 150 50 Z"
            fill="${CORES.secundaria}"
            stroke="#ffffff"
            stroke-width="2"
          />

          <!-- Círculo interno (donut) -->
          <circle cx="150" cy="150" r="60" fill="#ffffff" />

          <!-- Texto central -->
          <text x="150" y="145" text-anchor="middle" font-size="14" fill="${CORES.textoClaro}">Total</text>
          <text x="150" y="165" text-anchor="middle" font-size="18" font-weight="bold" fill="${CORES.texto}">
            ${percentualEmpenhado.toFixed(1)}%
          </text>
        </svg>

        <!-- Legenda -->
        <div style="display: flex; gap: 30px; margin-top: 20px; font-size: 14px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; background-color: ${CORES.primaria}; border-radius: 2px;"></div>
            <span style="color: ${CORES.texto};">Empenhado (${percentualEmpenhado.toFixed(1)}%)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; background-color: ${CORES.secundaria}; border-radius: 2px;"></div>
            <span style="color: ${CORES.texto};">Saldo (${percentualSaldo.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    `

    return await converterElementoParaImagem(elemento)
  } finally {
    removerElementoTemporario(elemento)
  }
}

/**
 * Gera gráfico de barra: Execução Temporal
 * Mostra progresso temporal vs progresso financeiro
 */
export const gerarGraficoExecucaoTemporal = async (
  contrato: ContratoRelatorio,
): Promise<string> => {
  const elemento = criarElementoTemporario(600, 300)

  try {
    const percentualTemporal = contrato.vigencia.percentualTemporal
    const percentualFinanceiro = contrato.valores.percentualExecutado

    elemento.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="margin: 0 0 20px 0; color: ${CORES.texto}; font-size: 18px;">Execução Temporal vs Financeira</h3>

        <!-- Barra: Progresso Temporal -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: ${CORES.textoClaro}; font-size: 14px;">Progresso Temporal</span>
            <span style="color: ${CORES.texto}; font-weight: bold; font-size: 14px;">${percentualTemporal.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 40px; background-color: ${CORES.fundoMedio}; border-radius: 8px; overflow: hidden;">
            <div style="width: ${percentualTemporal}%; height: 100%; background-color: ${CORES.primaria}; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;">
              <span style="color: white; font-weight: bold; font-size: 12px;">${percentualTemporal.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <!-- Barra: Progresso Financeiro -->
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: ${CORES.textoClaro}; font-size: 14px;">Execução Financeira</span>
            <span style="color: ${CORES.texto}; font-weight: bold; font-size: 14px;">${percentualFinanceiro.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 40px; background-color: ${CORES.fundoMedio}; border-radius: 8px; overflow: hidden;">
            <div style="width: ${percentualFinanceiro}%; height: 100%; background-color: ${CORES.secundaria}; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;">
              <span style="color: white; font-weight: bold; font-size: 12px;">${percentualFinanceiro.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <!-- Análise -->
        <div style="margin-top: 20px; padding: 12px; background-color: ${CORES.fundoClaro}; border-left: 3px solid ${CORES.primaria}; border-radius: 4px;">
          <p style="margin: 0; color: ${CORES.texto}; font-size: 12px; line-height: 1.5;">
            ${percentualFinanceiro >= percentualTemporal
              ? '✓ Execução financeira está alinhada com o progresso temporal'
              : '⚠ Execução financeira está abaixo do esperado para o período'}
          </p>
        </div>
      </div>
    `

    return await converterElementoParaImagem(elemento)
  } finally {
    removerElementoTemporario(elemento)
  }
}

/**
 * Gera gráfico de barras: Distribuição de Empenhos
 * Mostra empenhos ao longo do tempo
 */
export const gerarGraficoDistribuicaoEmpenhos = async (
  contrato: ContratoRelatorio,
): Promise<string> => {
  const elemento = criarElementoTemporario(700, 400)

  try {
    if (!contrato.empenhos || contrato.empenhos.length === 0) {
      throw new Error('Nenhum empenho disponível para gerar gráfico')
    }

    // Agrupa empenhos por mês
    const empenhosPorMes = new Map<string, number>()

    contrato.empenhos.forEach((empenho) => {
      const data = new Date(empenho.data)
      const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`
      const valorAtual = empenhosPorMes.get(mesAno) || 0
      empenhosPorMes.set(mesAno, valorAtual + empenho.valor)
    })

    const meses = Array.from(empenhosPorMes.keys()).sort()
    const valores = meses.map((mes) => empenhosPorMes.get(mes) || 0)
    const valorMaximo = Math.max(...valores)

    // Gera barras HTML
    const barrasHTML = meses
      .map((mes, index) => {
        const valor = valores[index]
        const altura = (valor / valorMaximo) * 200
        const percentual = ((valor / contrato.valores.global) * 100).toFixed(1)

        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
            <div style="height: 200px; display: flex; align-items: flex-end; justify-content: center; width: 100%;">
              <div style="width: 60%; background-color: ${CORES.primaria}; height: ${altura}px; border-radius: 4px 4px 0 0; position: relative;">
                <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: bold; color: ${CORES.texto}; white-space: nowrap;">
                  ${percentual}%
                </span>
              </div>
            </div>
            <span style="margin-top: 8px; font-size: 12px; color: ${CORES.textoClaro}; white-space: nowrap;">${mes}</span>
          </div>
        `
      })
      .join('')

    elemento.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="margin: 0 0 30px 0; color: ${CORES.texto}; font-size: 18px;">Distribuição de Empenhos por Mês</h3>
        <div style="display: flex; gap: 8px; align-items: flex-end;">
          ${barrasHTML}
        </div>
        <div style="margin-top: 20px; padding: 12px; background-color: ${CORES.fundoClaro}; border-radius: 4px;">
          <p style="margin: 0; color: ${CORES.texto}; font-size: 12px;">
            Total de ${contrato.empenhos.length} empenho(s) distribuído(s) ao longo do período
          </p>
        </div>
      </div>
    `

    return await converterElementoParaImagem(elemento)
  } finally {
    removerElementoTemporario(elemento)
  }
}

/**
 * Gera gráfico de linha: Evolução Mensal
 * Mostra evolução da execução mês a mês
 */
export const gerarGraficoEvolucaoMensal = async (
  contrato: ContratoRelatorio,
): Promise<string> => {
  const elemento = criarElementoTemporario(700, 400)

  try {
    // Gera pontos mensais baseados na vigência e execução
    const dataInicio = new Date(contrato.vigencia.inicial)
    const dataFim = new Date(contrato.vigencia.final)
    const dataAtual = new Date()

    const meses: string[] = []
    const percentuais: number[] = []

    let dataIteracao = new Date(dataInicio)
    let mesAtual = 0

    while (dataIteracao <= dataAtual && dataIteracao <= dataFim) {
      const mesAno = `${String(dataIteracao.getMonth() + 1).padStart(2, '0')}/${dataIteracao.getFullYear().toString().slice(2)}`
      meses.push(mesAno)

      // Calcula percentual proporcional ao tempo
      const percentualTemporal =
        ((mesAtual + 1) / contrato.vigencia.prazoMeses) * 100
      const percentualAjustado = Math.min(
        percentualTemporal * (contrato.valores.percentualExecutado / 100),
        100,
      )
      percentuais.push(percentualAjustado)

      dataIteracao.setMonth(dataIteracao.getMonth() + 1)
      mesAtual++
    }

    const valorMaximo = 100
    const larguraTotal = 600
    const alturaGrafico = 200
    const espacoEntrepontos = larguraTotal / (meses.length - 1 || 1)

    // Gera pontos SVG para a linha
    const pontosSVG = percentuais
      .map((percentual, index) => {
        const x = index * espacoEntrepontos
        const y = alturaGrafico - (percentual / valorMaximo) * alturaGrafico
        return `${x},${y}`
      })
      .join(' ')

    // Gera pontos de dados
    const pontosHTML = percentuais
      .map((percentual, index) => {
        const x = index * espacoEntrepontos
        const y = alturaGrafico - (percentual / valorMaximo) * alturaGrafico

        return `
          <circle cx="${x}" cy="${y}" r="4" fill="${CORES.primaria}" stroke="white" stroke-width="2" />
          <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="11" fill="${CORES.texto}" font-weight="bold">
            ${percentual.toFixed(0)}%
          </text>
        `
      })
      .join('')

    // Gera labels dos meses
    const labelsHTML = meses
      .map((mes, index) => {
        const x = index * espacoEntrepontos
        return `
          <text x="${x}" y="${alturaGrafico + 20}" text-anchor="middle" font-size="12" fill="${CORES.textoClaro}">
            ${mes}
          </text>
        `
      })
      .join('')

    elemento.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="margin: 0 0 20px 0; color: ${CORES.texto}; font-size: 18px;">Evolução Mensal da Execução</h3>
        <svg width="${larguraTotal}" height="${alturaGrafico + 40}" style="margin-top: 10px;">
          <!-- Grid horizontal -->
          <line x1="0" y1="${alturaGrafico}" x2="${larguraTotal}" y2="${alturaGrafico}" stroke="${CORES.borda}" stroke-width="1" />
          <line x1="0" y1="${alturaGrafico * 0.75}" x2="${larguraTotal}" y2="${alturaGrafico * 0.75}" stroke="${CORES.bordaClara}" stroke-width="1" stroke-dasharray="4" />
          <line x1="0" y1="${alturaGrafico * 0.5}" x2="${larguraTotal}" y2="${alturaGrafico * 0.5}" stroke="${CORES.bordaClara}" stroke-width="1" stroke-dasharray="4" />
          <line x1="0" y1="${alturaGrafico * 0.25}" x2="${larguraTotal}" y2="${alturaGrafico * 0.25}" stroke="${CORES.bordaClara}" stroke-width="1" stroke-dasharray="4" />
          <line x1="0" y1="0" x2="${larguraTotal}" y2="0" stroke="${CORES.borda}" stroke-width="1" />

          <!-- Área sob a linha -->
          <polygon points="0,${alturaGrafico} ${pontosSVG} ${larguraTotal},${alturaGrafico}" fill="${CORES.primaria}" opacity="0.1" />

          <!-- Linha principal -->
          <polyline points="${pontosSVG}" fill="none" stroke="${CORES.primaria}" stroke-width="3" />

          <!-- Pontos de dados -->
          ${pontosHTML}

          <!-- Labels dos meses -->
          ${labelsHTML}
        </svg>

        <div style="margin-top: 20px; padding: 12px; background-color: ${CORES.fundoClaro}; border-radius: 4px;">
          <p style="margin: 0; color: ${CORES.texto}; font-size: 12px;">
            Execução atual: ${contrato.valores.percentualExecutado.toFixed(1)}% |
            Progresso temporal: ${contrato.vigencia.percentualTemporal.toFixed(1)}%
          </p>
        </div>
      </div>
    `

    return await converterElementoParaImagem(elemento)
  } finally {
    removerElementoTemporario(elemento)
  }
}

// ========== EXPORTAÇÃO CONSOLIDADA ==========

export interface GraficosGerados {
  execucaoFinanceira?: string
  execucaoTemporal?: string
  distribuicaoEmpenhos?: string
  evolucaoMensal?: string
}

/**
 * Gera todos os gráficos necessários para um relatório de execução
 */
export const gerarTodosGraficosExecucao = async (
  contrato: ContratoRelatorio,
): Promise<GraficosGerados> => {
  const graficos: GraficosGerados = {}

  try {
    // Gráficos sempre gerados
    graficos.execucaoFinanceira = await gerarGraficoExecucaoFinanceira(contrato)
    graficos.execucaoTemporal = await gerarGraficoExecucaoTemporal(contrato)

    // Gráficos condicionais
    if (contrato.empenhos && contrato.empenhos.length > 0) {
      graficos.distribuicaoEmpenhos =
        await gerarGraficoDistribuicaoEmpenhos(contrato)
    }

    graficos.evolucaoMensal = await gerarGraficoEvolucaoMensal(contrato)

    return graficos
  } catch (erro) {
    console.error('Erro ao gerar gráficos:', erro)
    // Retorna gráficos que conseguiram ser gerados
    return graficos
  }
}
