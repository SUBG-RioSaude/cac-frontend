// vite.config.ts
import path from 'path'
import { defineConfig, type UserConfig } from 'vite'

import react from '@vitejs/plugin-react-swc'
import { tanstackRouter } from '@tanstack/router-vite-plugin'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tanstackRouter({
   target: 'react',
   autoCodeSplitting: true,
  }), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Configuração do Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup-tests.ts',
  },
} as UserConfig)
