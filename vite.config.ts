// vite.config.ts
import path from 'path'
import { defineConfig, type UserConfig } from 'vite'
import fs from 'fs'

import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Ler versão do package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
)

// Obter informações de build do ambiente ou git
const getCommitSha = (): string => {
  try {
    return (
      process.env.VITE_COMMIT_SHA ||
      process.env.GITHUB_SHA?.substring(0, 7) ||
      'dev'
    )
  } catch {
    return 'dev'
  }
}

const getBuildNumber = (): string => {
  return process.env.VITE_BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || '0'
}

const getBuildTimestamp = (): string => {
  return (
    process.env.VITE_BUILD_TIME || new Date().toISOString().split('T')[0] || ''
  )
}

const getEnvironment = (): string => {
  return process.env.VITE_APP_ENV || process.env.NODE_ENV || 'development'
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_SHA__: JSON.stringify(getCommitSha()),
    __BUILD_NUMBER__: JSON.stringify(getBuildNumber()),
    __BUILD_TIMESTAMP__: JSON.stringify(getBuildTimestamp()),
    __APP_ENVIRONMENT__: JSON.stringify(getEnvironment()),
  },
  // Configuração do Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup-tests.ts',
    tsconfig: './tsconfig.test.json',
    // Configuração de coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/mock*/**',
        '**/*mock*',
        '**/*.stories.*',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
} as UserConfig)
