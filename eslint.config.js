import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import security from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores([
    'dist',
    'node_modules',
    '**/*.d.ts',
    'vite.config.ts',
    '*.config.*',
    // Ignorar componentes base shadcn/ui (não devem ser modificados)
    'src/components/ui/**/*.tsx',
    'src/components/ui/**/*.ts',
    // Permitir apenas testes customizados se necessário
    '!src/components/ui/__tests__/**/*',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.app.json', './tsconfig.test.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.app.json'],
        },
      },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      security,
    },
    rules: {
      // === CRITICAL SECURITY & A11Y ===
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'security/detect-eval-with-expression': 'error',

      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // === TYPESCRIPT IMPROVEMENTS (Auto-fixable) ===
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Safer than ||
      '@typescript-eslint/prefer-optional-chain': 'warn', // Cleaner syntax

      // === REACT ESSENTIALS ===
      'react/jsx-key': 'error', // Critical for lists
      'react/no-array-index-key': 'warn',

      // === MIGRATION WARNINGS ===
      // These will become errors gradually
      'no-console': 'warn', // Usar logger ao invés de console
      '@typescript-eslint/no-explicit-any': 'off', // 27 occurrences
      '@typescript-eslint/no-unused-vars': 'off', // Was disabled
      'react/jsx-no-bind': 'off', // Performance issue

      // === TEMPORARILY DISABLED (Too disruptive) ===
      // Will be enabled later in migration
      'import/order': 'off', // Too many import order issues
      'react/function-component-definition': 'off', // Component style issues
      'jsx-a11y/click-events-have-key-events': 'off', // A11y issues
      'jsx-a11y/no-static-element-interactions': 'off', // A11y issues
      '@typescript-eslint/no-unnecessary-condition': 'off', // TS strict issues
      '@typescript-eslint/no-unsafe-assignment': 'off', // Too many any issues
      '@typescript-eslint/no-unsafe-return': 'off', // Too many any issues
      '@typescript-eslint/no-misused-promises': 'off', // Promise handling issues
      '@typescript-eslint/no-floating-promises': 'off', // Promise handling issues
      '@typescript-eslint/require-await': 'off', // Async function issues
      '@typescript-eslint/no-unsafe-member-access': 'off', // Any member access issues
      '@typescript-eslint/no-unsafe-call': 'off', // Any call issues

      // === DISABLED RULES ===
      'react-refresh/only-export-components': 'off',
      'react/require-default-props': 'off', // TypeScript handles this
      'react/jsx-filename-extension': 'off', // .tsx already enforced
      'import/prefer-default-export': 'off', // Named exports preferred
      'import/extensions': 'off', // Vite handles this
    },
  },

  // Configuração específica para arquivos de teste
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'security/detect-eval-with-expression': 'off',
    },
  },
])
