/**
 * ==========================================
 * HOOK: USE-GERAR-RELATORIO
 * ==========================================
 * Orquestra o processo completo de geração de relatórios
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

import type {
  DadosRelatorio,
  TipoRelatorio,
  ConfiguracaoPersonalizacao,
} from '../types/relatorio'
import {
  gerarRelatorioPDF,
  gerarEBaixarRelatorioPDF,
  gerarPreviewPDF,
  validarRelatorio,
  estimarTamanhoPDF,
  type ProgressoGeracao,
} from '../services/pdf-generator-service'
import { useDadosRelatorio } from './use-dados-relatorio'
import { MENSAGENS } from '../config/relatorios-config'

// ========== TIPOS ==========

export interface OpcoesGeracao {
  tipo: TipoRelatorio
  idsContratos: string[]
  configuracao?: ConfiguracaoPersonalizacao
  autoDownload?: boolean
  salvarHistorico?: boolean
  contratosBase?: any[] // Contratos já carregados da lista
}

export interface EstadoGeracao {
  gerando: boolean
  progresso: ProgressoGeracao | null
  erro: string | null
  urlPreview: string | null
  tamanhoEstimado: number
}

export interface ResultadoGeracao {
  estado: EstadoGeracao
  gerarRelatorio: () => Promise<void>
  gerarPreview: () => Promise<void>
  baixarRelatorio: () => Promise<void>
  cancelar: () => void
  limparErro: () => void
}

// ========== ESTADO INICIAL ==========

const ESTADO_INICIAL: EstadoGeracao = {
  gerando: false,
  progresso: null,
  erro: null,
  urlPreview: null,
  tamanhoEstimado: 0,
}

// ========== HOOK PRINCIPAL ==========

/**
 * Hook para gerenciar o processo de geração de relatórios
 */
export const useGerarRelatorio = ({
  tipo,
  idsContratos,
  configuracao,
  autoDownload = true,
  salvarHistorico = true,
  contratosBase, // Contratos já carregados da lista
}: OpcoesGeracao): ResultadoGeracao => {
  // Estado local
  const [estado, setEstado] = useState<EstadoGeracao>(ESTADO_INICIAL)

  // Busca dados dos contratos
  const {
    contratos,
    isLoading: carregandoDados,
    isError: erroCarregamento,
    erro: erroAPI,
  } = useDadosRelatorio({
    idsContratos,
    tipo,
    enabled: idsContratos.length > 0,
    contratosBase, // Passa contratos base para usar como fallback
  })

  // ========== CALLBACKS ==========

  /**
   * Callback de progresso
   */
  const atualizarProgresso = useCallback((progresso: ProgressoGeracao) => {
    setEstado((prev) => ({
      ...prev,
      progresso,
    }))
  }, [])

  /**
   * Prepara dados para geração
   */
  const prepararDados = useCallback((): DadosRelatorio => {
    return {
      tipo,
      contratos,
      dataGeracao: new Date().toISOString(),
      configuracao,
      graficos: {},
    }
  }, [tipo, contratos, configuracao])

  /**
   * Valida se pode gerar relatório
   */
  const validarGeracao = useCallback((): boolean => {
    // Verifica se ainda está carregando dados
    if (carregandoDados) {
      toast.error('Aguarde o carregamento dos dados dos contratos')
      return false
    }

    // Verifica se houve erro no carregamento
    if (erroCarregamento || erroAPI) {
      toast.error('Erro ao carregar dados dos contratos')
      setEstado((prev) => ({
        ...prev,
        erro: erroAPI?.message || 'Erro ao carregar contratos',
      }))
      return false
    }

    // Verifica se há contratos carregados
    if (!contratos || contratos.length === 0) {
      toast.error(MENSAGENS.validacao.nenhumContratoSelecionado)
      return false
    }

    // Valida dados do relatório
    const dados = prepararDados()
    const { valido, erros } = validarRelatorio(dados)

    if (!valido) {
      const mensagemErro = erros[0] || MENSAGENS.validacao.dadosInvalidos
      toast.error(mensagemErro)
      setEstado((prev) => ({ ...prev, erro: mensagemErro }))
      return false
    }

    return true
  }, [
    carregandoDados,
    erroCarregamento,
    erroAPI,
    contratos,
    prepararDados,
  ])

  /**
   * Gera relatório completo
   */
  const gerarRelatorio = useCallback(async () => {
    if (!validarGeracao()) return

    try {
      // Inicia geração
      setEstado((prev) => ({
        ...prev,
        gerando: true,
        erro: null,
        progresso: {
          etapa: 'validando',
          progresso: 0,
          mensagem: MENSAGENS.geracao.iniciando,
        },
      }))

      toast.info(MENSAGENS.geracao.iniciando)

      const dados = prepararDados()
      const tamanhoEstimado = estimarTamanhoPDF(dados)

      setEstado((prev) => ({ ...prev, tamanhoEstimado }))

      // Gera e baixa PDF
      if (autoDownload) {
        await gerarEBaixarRelatorioPDF(
          dados,
          { salvarHistorico },
          atualizarProgresso,
        )
        toast.success(MENSAGENS.geracao.sucesso)
      } else {
        await gerarRelatorioPDF(dados, { salvarHistorico }, atualizarProgresso)
      }

      // Finaliza
      setEstado((prev) => ({
        ...prev,
        gerando: false,
        progresso: {
          etapa: 'concluido',
          progresso: 100,
          mensagem: MENSAGENS.geracao.sucesso,
        },
      }))
    } catch (erro) {
      console.error('Erro ao gerar relatório:', erro)

      const mensagemErro =
        erro instanceof Error ? erro.message : MENSAGENS.geracao.erro

      setEstado((prev) => ({
        ...prev,
        gerando: false,
        erro: mensagemErro,
        progresso: null,
      }))

      toast.error(mensagemErro)
    }
  }, [
    validarGeracao,
    prepararDados,
    autoDownload,
    salvarHistorico,
    atualizarProgresso,
  ])

  /**
   * Gera preview do relatório
   */
  const gerarPreview = useCallback(async () => {
    if (!validarGeracao()) return

    try {
      setEstado((prev) => ({
        ...prev,
        gerando: true,
        erro: null,
        progresso: {
          etapa: 'montando-pdf',
          progresso: 50,
          mensagem: 'Gerando preview...',
        },
      }))

      const dados = prepararDados()
      const urlPreview = await gerarPreviewPDF(dados, atualizarProgresso)

      setEstado((prev) => ({
        ...prev,
        gerando: false,
        urlPreview,
        progresso: {
          etapa: 'concluido',
          progresso: 100,
          mensagem: 'Preview gerado com sucesso',
        },
      }))

      toast.success('Preview gerado com sucesso')
    } catch (erro) {
      console.error('Erro ao gerar preview:', erro)

      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro ao gerar preview'

      setEstado((prev) => ({
        ...prev,
        gerando: false,
        erro: mensagemErro,
      }))

      toast.error(mensagemErro)
    }
  }, [validarGeracao, prepararDados, atualizarProgresso])

  /**
   * Gera e baixa relatório (força download independente de autoDownload)
   */
  const gerarEBaixarAgora = useCallback(async () => {
    if (!validarGeracao()) return

    try {
      // Inicia geração
      setEstado((prev) => ({
        ...prev,
        gerando: true,
        erro: null,
        progresso: {
          etapa: 'validando',
          progresso: 0,
          mensagem: MENSAGENS.geracao.iniciando,
        },
      }))

      toast.info(MENSAGENS.geracao.iniciando)

      const dados = prepararDados()
      const tamanhoEstimado = estimarTamanhoPDF(dados)

      setEstado((prev) => ({ ...prev, tamanhoEstimado }))

      // FORÇA download independente de autoDownload
      await gerarEBaixarRelatorioPDF(
        dados,
        { salvarHistorico },
        atualizarProgresso,
      )

      // Finaliza
      setEstado((prev) => ({
        ...prev,
        gerando: false,
        progresso: {
          etapa: 'concluido',
          progresso: 100,
          mensagem: MENSAGENS.geracao.sucesso,
        },
      }))

      toast.success(MENSAGENS.geracao.sucesso)
    } catch (erro) {
      console.error('Erro ao gerar e baixar relatório:', erro)

      const mensagemErro =
        erro instanceof Error ? erro.message : MENSAGENS.geracao.erro

      setEstado((prev) => ({
        ...prev,
        gerando: false,
        erro: mensagemErro,
        progresso: null,
      }))

      toast.error(mensagemErro)
    }
  }, [validarGeracao, prepararDados, salvarHistorico, atualizarProgresso])

  /**
   * Baixa relatório já gerado (alias para gerarEBaixarAgora)
   */
  const baixarRelatorio = useCallback(async () => {
    await gerarEBaixarAgora()
  }, [gerarEBaixarAgora])

  /**
   * Cancela geração em andamento
   */
  const cancelar = useCallback(() => {
    setEstado(ESTADO_INICIAL)
    toast.info('Geração cancelada')
  }, [])

  /**
   * Limpa erro
   */
  const limparErro = useCallback(() => {
    setEstado((prev) => ({ ...prev, erro: null }))
  }, [])

  // ========== RETORNO ==========

  return {
    estado: {
      ...estado,
      // Inclui loading dos dados na geração
      gerando: estado.gerando || carregandoDados,
    },
    gerarRelatorio,
    gerarPreview,
    baixarRelatorio,
    cancelar,
    limparErro,
  }
}

/**
 * Hook simplificado para geração rápida
 */
export const useGerarRelatorioRapido = (
  tipo: TipoRelatorio,
  idsContratos: number[],
) => {
  const { estado, gerarRelatorio } = useGerarRelatorio({
    tipo,
    idsContratos,
    autoDownload: true,
    salvarHistorico: true,
  })

  return {
    gerando: estado.gerando,
    progresso: estado.progresso?.progresso || 0,
    mensagem: estado.progresso?.mensagem || '',
    erro: estado.erro,
    gerar: gerarRelatorio,
  }
}

/**
 * Hook para geração com preview
 */
export const useGerarRelatorioComPreview = (
  tipo: TipoRelatorio,
  idsContratos: number[],
) => {
  const resultado = useGerarRelatorio({
    tipo,
    idsContratos,
    autoDownload: false,
    salvarHistorico: false,
  })

  return {
    ...resultado,
    temPreview: !!resultado.estado.urlPreview,
  }
}
