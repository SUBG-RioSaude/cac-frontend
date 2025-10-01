import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  obterVersaoBase,
  obterCommitSha,
  obterBuildNumber,
  obterBuildTimestamp,
  obterAmbiente,
  obterVersaoApp,
  obterVersaoCompleta,
  obterMetadataVersao,
  obterAnoAtual,
  VERSAO_APP,
} from '../versao'

// Mock das variáveis globais injetadas pelo Vite
declare global {
   
  var __APP_VERSION__: string
   
  var __COMMIT_SHA__: string
   
  var __BUILD_NUMBER__: string
   
  var __BUILD_TIMESTAMP__: string
   
  var __APP_ENVIRONMENT__: string
}

describe('lib/versao', () => {
  beforeEach(() => {
    // Setup valores padrão para os testes
    globalThis.__APP_VERSION__ = '1.0.0'
    globalThis.__COMMIT_SHA__ = 'abc1234'
    globalThis.__BUILD_NUMBER__ = '123'
    globalThis.__BUILD_TIMESTAMP__ = '2025-10-01'
    globalThis.__APP_ENVIRONMENT__ = 'development'
  })

  describe('obterVersaoBase', () => {
    it('deve retornar a versão base do package.json', () => {
      const versao = obterVersaoBase()
      expect(versao).toBe('1.0.0')
    })
  })

  describe('obterCommitSha', () => {
    it('deve retornar o commit SHA injetado', () => {
      const commitSha = obterCommitSha()
      expect(commitSha).toBe('abc1234')
    })
  })

  describe('obterBuildNumber', () => {
    it('deve retornar o número do build', () => {
      const buildNumber = obterBuildNumber()
      expect(buildNumber).toBe('123')
    })
  })

  describe('obterBuildTimestamp', () => {
    it('deve retornar o timestamp do build', () => {
      const timestamp = obterBuildTimestamp()
      expect(timestamp).toBe('2025-10-01')
    })
  })

  describe('obterAmbiente', () => {
    it('deve retornar o ambiente da aplicação', () => {
      const ambiente = obterAmbiente()
      expect(ambiente).toBe('development')
    })
  })

  describe('obterVersaoApp', () => {
    it('deve retornar versão base em produção', () => {
      globalThis.__APP_ENVIRONMENT__ = 'production'
      const versao = obterVersaoApp()
      expect(versao).toBe('1.0.0')
    })

    it('deve retornar versão com staging e build number em staging', () => {
      globalThis.__APP_ENVIRONMENT__ = 'staging'
      globalThis.__BUILD_NUMBER__ = '456'
      const versao = obterVersaoApp()
      expect(versao).toBe('1.0.0-staging.456')
    })

    it('deve retornar versão com dev em development', () => {
      globalThis.__APP_ENVIRONMENT__ = 'development'
      const versao = obterVersaoApp()
      expect(versao).toBe('1.0.0-dev')
    })
  })

  describe('obterVersaoCompleta', () => {
    it('deve retornar versão completa com metadata', () => {
      const versaoCompleta = obterVersaoCompleta()
      expect(versaoCompleta).toContain('1.0.0-dev')
      expect(versaoCompleta).toContain('abc1234')
      expect(versaoCompleta).toContain('Build #123')
      expect(versaoCompleta).toContain('2025-10-01')
    })

    it('deve formatar corretamente para produção', () => {
      globalThis.__APP_ENVIRONMENT__ = 'production'
      const versaoCompleta = obterVersaoCompleta()
      expect(versaoCompleta).toBe('1.0.0+abc1234 (Build #123, 2025-10-01)')
    })

    it('deve formatar corretamente para staging', () => {
      globalThis.__APP_ENVIRONMENT__ = 'staging'
      globalThis.__BUILD_NUMBER__ = '789'
      const versaoCompleta = obterVersaoCompleta()
      expect(versaoCompleta).toBe(
        '1.0.0-staging.789+abc1234 (Build #789, 2025-10-01)'
      )
    })
  })

  describe('obterMetadataVersao', () => {
    it('deve retornar objeto com todos os metadados', () => {
      const metadata = obterMetadataVersao()

      expect(metadata).toEqual({
        versao: '1.0.0-dev',
        commitSha: 'abc1234',
        buildNumber: '123',
        buildTimestamp: '2025-10-01',
        ambiente: 'development',
      })
    })

    it('deve ter todas as propriedades necessárias', () => {
      const metadata = obterMetadataVersao()

      expect(metadata).toHaveProperty('versao')
      expect(metadata).toHaveProperty('commitSha')
      expect(metadata).toHaveProperty('buildNumber')
      expect(metadata).toHaveProperty('buildTimestamp')
      expect(metadata).toHaveProperty('ambiente')
    })
  })

  describe('obterAnoAtual', () => {
    it('deve retornar o ano atual', () => {
      const anoAtual = obterAnoAtual()
      const anoEsperado = new Date().getFullYear()
      expect(anoAtual).toBe(anoEsperado)
    })

    it('deve retornar um número', () => {
      const anoAtual = obterAnoAtual()
      expect(typeof anoAtual).toBe('number')
    })

    it('deve retornar um ano válido (> 2020)', () => {
      const anoAtual = obterAnoAtual()
      expect(anoAtual).toBeGreaterThan(2020)
    })
  })

  describe('VERSAO_APP (export legado)', () => {
    it('deve exportar constante com versão base', () => {
      expect(VERSAO_APP).toBe('1.0.0')
    })
  })

  describe('Cenários de ambiente específicos', () => {
    it('deve diferenciar entre ambientes corretamente', () => {
      // Production
      globalThis.__APP_ENVIRONMENT__ = 'production'
      expect(obterVersaoApp()).toBe('1.0.0')

      // Staging
      globalThis.__APP_ENVIRONMENT__ = 'staging'
      globalThis.__BUILD_NUMBER__ = '100'
      expect(obterVersaoApp()).toBe('1.0.0-staging.100')

      // Development
      globalThis.__APP_ENVIRONMENT__ = 'development'
      expect(obterVersaoApp()).toBe('1.0.0-dev')

      // Ambiente desconhecido (deve ser tratado como dev)
      globalThis.__APP_ENVIRONMENT__ = 'unknown'
      expect(obterVersaoApp()).toBe('1.0.0-dev')
    })
  })

  describe('Integração com valores mock', () => {
    it('deve funcionar com valores de desenvolvimento local', () => {
      globalThis.__COMMIT_SHA__ = 'dev'
      globalThis.__BUILD_NUMBER__ = '0'
      globalThis.__APP_ENVIRONMENT__ = 'development'

      const metadata = obterMetadataVersao()

      expect(metadata.commitSha).toBe('dev')
      expect(metadata.buildNumber).toBe('0')
      expect(metadata.versao).toBe('1.0.0-dev')
    })

    it('deve funcionar com valores reais de CI/CD', () => {
      globalThis.__COMMIT_SHA__ = 'f4b3c2a'
      globalThis.__BUILD_NUMBER__ = '999'
      globalThis.__APP_ENVIRONMENT__ = 'production'
      globalThis.__BUILD_TIMESTAMP__ = '2025-12-31'

      const versaoCompleta = obterVersaoCompleta()

      expect(versaoCompleta).toContain('f4b3c2a')
      expect(versaoCompleta).toContain('999')
      expect(versaoCompleta).toContain('2025-12-31')
    })
  })
})
