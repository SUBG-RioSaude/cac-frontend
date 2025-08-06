/**
 * Utilitário para obter informações de versão da aplicação.
 */

// Em um ambiente de produção real, isso seria injetado durante o build
// Por enquanto, mantemos como constante para simplificar
export const VERSAO_APP = '1.0.0'

/**
 * Retorna a versão atual da aplicação.
 */
export const obterVersaoApp = (): string => {
  return VERSAO_APP
}

/**
 * Retorna o ano atual para uso no copyright.
 */
export const obterAnoAtual = (): number => {
  return new Date().getFullYear()
}
