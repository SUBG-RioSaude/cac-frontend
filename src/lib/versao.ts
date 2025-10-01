/**
 * Utilitário para obter informações de versão da aplicação.
 * As variáveis são injetadas em build time via vite.config.ts
 */

export interface VersaoMetadata {
  versao: string
  commitSha: string
  buildNumber: string
  buildTimestamp: string
  ambiente: string
}

/**
 * Retorna a versão base (semver) da aplicação.
 * Exemplo: "1.0.0"
 */
export const obterVersaoBase = (): string => {
  return __APP_VERSION__
}

/**
 * Retorna o commit SHA do build.
 * Exemplo: "abc1234" ou "dev" em desenvolvimento local
 */
export const obterCommitSha = (): string => {
  return __COMMIT_SHA__
}

/**
 * Retorna o número do build do CI/CD.
 * Exemplo: "123" ou "0" em desenvolvimento local
 */
export const obterBuildNumber = (): string => {
  return __BUILD_NUMBER__
}

/**
 * Retorna o timestamp do build.
 * Exemplo: "2025-10-01"
 */
export const obterBuildTimestamp = (): string => {
  return __BUILD_TIMESTAMP__
}

/**
 * Retorna o ambiente da aplicação.
 * Exemplo: "production", "staging", "development"
 */
export const obterAmbiente = (): string => {
  return __APP_ENVIRONMENT__
}

/**
 * Retorna a versão formatada baseado no ambiente.
 *
 * Formatos:
 * - Produção: "1.0.0"
 * - Staging: "1.0.0-staging.123"
 * - Development: "1.0.0-dev"
 *
 * @returns Versão formatada da aplicação
 */
export const obterVersaoApp = (): string => {
  const versaoBase = obterVersaoBase()
  const ambiente = obterAmbiente()
  const buildNumber = obterBuildNumber()

  // Produção: apenas versão semântica
  if (ambiente === 'production') {
    return versaoBase
  }

  // Staging: versão + staging + build number
  if (ambiente === 'staging') {
    return `${versaoBase}-staging.${buildNumber}`
  }

  // Development: versão + dev
  return `${versaoBase}-dev`
}

/**
 * Retorna a versão completa com metadata para tooltips/debug.
 *
 * Formato: "1.0.0-dev+abc1234 (Build #0, 2025-10-01)"
 *
 * @returns Versão completa com metadados
 */
export const obterVersaoCompleta = (): string => {
  const versao = obterVersaoApp()
  const commitSha = obterCommitSha()
  const buildNumber = obterBuildNumber()
  const buildTimestamp = obterBuildTimestamp()

  return `${versao}+${commitSha} (Build #${buildNumber}, ${buildTimestamp})`
}

/**
 * Retorna todos os metadados da versão.
 *
 * @returns Objeto com todos os metadados
 */
export const obterMetadataVersao = (): VersaoMetadata => {
  return {
    versao: obterVersaoApp(),
    commitSha: obterCommitSha(),
    buildNumber: obterBuildNumber(),
    buildTimestamp: obterBuildTimestamp(),
    ambiente: obterAmbiente(),
  }
}

/**
 * Retorna o ano atual para uso no copyright.
 */
export const obterAnoAtual = (): number => {
  return new Date().getFullYear()
}

// Export legado para compatibilidade
export const VERSAO_APP = obterVersaoBase()
