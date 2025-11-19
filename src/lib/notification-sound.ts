/**
 * Utilitários para reproduzir sons de notificação
 * Suporta controle de volume e verificação de preferências
 */

import type { PreferenciasLocais } from '@/types/notificacao'

// Re-export do tipo para facilitar uso
export type { PreferenciasLocais } from '@/types/notificacao'

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Caminho do arquivo de som de notificação
 */
const SOM_NOTIFICACAO_PATH = '/sounds/notification.mp3'

/**
 * Chave para armazenar preferências locais no localStorage
 */
const PREFERENCIAS_LOCAIS_KEY = 'notificacoes:preferencias-locais'

/**
 * Preferências padrão
 */
const PREFERENCIAS_PADRAO: PreferenciasLocais = {
  somHabilitado: true,
  notificacoesNativasHabilitadas: true,
  volumeSom: 0.5,
}

// ============================================================================
// GERENCIAMENTO DE PREFERÊNCIAS LOCAIS
// ============================================================================

/**
 * Obtém preferências locais do localStorage
 *
 * @returns Preferências locais
 */
export const obterPreferenciasLocais = (): PreferenciasLocais => {
  try {
    const stored = localStorage.getItem(PREFERENCIAS_LOCAIS_KEY)
    if (stored) {
      const preferencias = JSON.parse(stored) as Partial<PreferenciasLocais>
      return {
        ...PREFERENCIAS_PADRAO,
        ...preferencias,
      }
    }
  } catch (erro) {
    console.error('[Preferências Locais] Erro ao ler do localStorage:', erro)
  }

  return PREFERENCIAS_PADRAO
}

/**
 * Salva preferências locais no localStorage
 *
 * @param preferencias - Preferências a salvar
 */
export const salvarPreferenciasLocais = (
  preferencias: Partial<PreferenciasLocais>,
): void => {
  try {
    const atual = obterPreferenciasLocais()
    const novas = { ...atual, ...preferencias }

    localStorage.setItem(PREFERENCIAS_LOCAIS_KEY, JSON.stringify(novas))
  } catch (erro) {
    console.error('[Preferências Locais] Erro ao salvar no localStorage:', erro)
  }
}

// ============================================================================
// REPRODUÇÃO DE SOM
// ============================================================================

/**
 * Toca o som de notificação
 * Verifica se o som está habilitado nas preferências antes de tocar
 *
 * @param volume - Volume do som (0.0 a 1.0). Se não fornecido, usa preferências
 * @returns Promise que resolve quando o som terminar ou null se som desabilitado
 *
 * @example
 * ```ts
 * // Tocar com volume das preferências
 * await tocarSomNotificacao()
 *
 * // Tocar com volume customizado
 * await tocarSomNotificacao(0.8)
 * ```
 */
export const tocarSomNotificacao = async (
  volume?: number,
): Promise<void | null> => {
  try {
    // Verifica preferências
    const preferencias = obterPreferenciasLocais()

    if (!preferencias.somHabilitado) {
      console.log('[Som] Som desabilitado nas preferências')
      return null
    }

    // Cria e configura Audio
    const audio = new Audio(SOM_NOTIFICACAO_PATH)
    audio.volume = volume ?? preferencias.volumeSom

    // Toca o som
    await audio.play()

    console.log('[Som] Som de notificação reproduzido')
  } catch (erro) {
    // Erros comuns:
    // - Arquivo não encontrado
    // - Usuário não interagiu com a página (autoplay blocked)
    // - Formato de áudio não suportado
    console.warn('[Som] Erro ao reproduzir som de notificação:', erro)

    // Não lança erro - falha silenciosa
    return null
  }
}

/**
 * Habilita o som de notificação
 */
export const habilitarSom = (): void => {
  salvarPreferenciasLocais({ somHabilitado: true })
  console.log('[Som] Som de notificação habilitado')
}

/**
 * Desabilita o som de notificação
 */
export const desabilitarSom = (): void => {
  salvarPreferenciasLocais({ somHabilitado: false })
  console.log('[Som] Som de notificação desabilitado')
}

/**
 * Alterna o estado do som (habilita/desabilita)
 *
 * @returns Novo estado (true = habilitado)
 */
export const alternarSom = (): boolean => {
  const preferencias = obterPreferenciasLocais()
  const novoEstado = !preferencias.somHabilitado

  salvarPreferenciasLocais({ somHabilitado: novoEstado })
  console.log(`[Som] Som ${novoEstado ? 'habilitado' : 'desabilitado'}`)

  return novoEstado
}

/**
 * Define o volume do som
 *
 * @param volume - Volume (0.0 a 1.0)
 */
export const definirVolume = (volume: number): void => {
  const volumeNormalizado = Math.max(0, Math.min(1, volume))
  salvarPreferenciasLocais({ volumeSom: volumeNormalizado })
  console.log(`[Som] Volume definido para ${volumeNormalizado}`)
}

/**
 * Verifica se o som está habilitado
 *
 * @returns true se habilitado
 */
export const somEstaHabilitado = (): boolean => {
  const preferencias = obterPreferenciasLocais()
  return preferencias.somHabilitado
}

// ============================================================================
// TESTE DE SOM
// ============================================================================

/**
 * Toca o som de teste independente das preferências
 * Útil para testar o som ao configurar preferências
 *
 * @param volume - Volume do som (padrão: 0.5)
 * @returns Promise que resolve quando o som terminar
 */
export const tocarSomTeste = async (volume = 0.5): Promise<void> => {
  try {
    const audio = new Audio(SOM_NOTIFICACAO_PATH)
    audio.volume = volume
    await audio.play()

    console.log('[Som] Som de teste reproduzido')
  } catch (erro) {
    console.error('[Som] Erro ao reproduzir som de teste:', erro)
    throw new Error(
      'Não foi possível reproduzir o som. Verifique se o arquivo existe.',
    )
  }
}
