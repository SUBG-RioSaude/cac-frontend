import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import security from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.d.ts',
      'vite.config.ts',
      '*.config.*',
      // Ignorar componentes base shadcn/ui (não devem ser modificados)
      'src/components/ui/**/*.tsx',
      'src/components/ui/**/*.ts',
      // Permitir apenas testes customizados se necessário
      '!src/components/ui/__tests__/**/*',
    ],
  },
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
      ...tseslint.configs.stylisticTypeChecked,
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
      // ===== AIRBNB JAVASCRIPT BASE RULES =====
      // Variables
      'no-unused-vars': 'off', // Handled by TypeScript
      'no-use-before-define': 'off', // Handled by TypeScript
      'no-shadow': 'off', // Handled by TypeScript

      // Best Practices
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],

      // Style - Using Prettier for these
      'comma-dangle': 'off', // Prettier handles this
      semi: 'off', // Prettier handles this
      quotes: 'off', // Prettier handles this
      indent: 'off', // Prettier handles this
      'no-trailing-spaces': 'off', // Prettier handles this
      'eol-last': 'off', // Prettier handles this

      // ===== AIRBNB REACT RULES =====
      // React Specific
      'react/jsx-key': 'error',
      'react/jsx-no-bind': [
        'error',
        {
          ignoreRefs: true,
          allowArrowFunctions: true,
          allowFunctions: false,
          allowBind: false,
          ignoreDOMComponents: true,
        },
      ],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-uses-react': 'off', // React 17+
      'react/jsx-uses-vars': 'error',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-did-mount-set-state': 'error',
      'react/no-did-update-set-state': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-is-mounted': 'error',
      'react/no-multi-comp': 'off',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/prefer-es6-class': ['error', 'always'],
      'react/prop-types': 'off', // TypeScript handles this
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/sort-comp': 'off', // Prefer hooks order
      'react/jsx-boolean-value': ['error', 'never', { always: [] }],
      'react/jsx-closing-bracket-location': 'off', // Prettier handles this
      'react/jsx-curly-spacing': 'off', // Prettier handles this
      'react/jsx-handler-names': 'off',
      'react/jsx-indent': 'off', // Prettier handles this
      'react/jsx-indent-props': 'off', // Prettier handles this
      'react/jsx-max-props-per-line': 'off', // Prettier handles this
      'react/jsx-no-literals': 'off',
      'react/jsx-one-expression-per-line': 'off', // Prettier handles this
      'react/jsx-props-no-multi-spaces': 'off', // Prettier handles this
      'react/jsx-sort-props': 'off',
      'react/jsx-tag-spacing': 'off', // Prettier handles this
      'react/jsx-wrap-multilines': [
        'error',
        {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'parens-new-line',
          logical: 'parens-new-line',
          prop: 'parens-new-line',
        },
      ],
      'react/no-array-index-key': 'warn',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      // ===== ACCESSIBILITY (A11Y) =====
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',

      // ===== IMPORT/EXPORT =====
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,tsx}',
            '**/__tests__/**/*',
            '**/vite.config.*',
            '**/vitest.config.*',
            '**/setup-tests.ts',
            '**/test-utils.tsx',
          ],
        },
      ],

      // ===== TYPESCRIPT AIRBNB STYLE =====
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      // ===== SECURITY =====
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',

      // ===== PROJECT SPECIFIC ADJUSTMENTS =====
      'no-console': 'warn', // Use logger instead
      'react/require-default-props': 'off', // TypeScript handles this
      'react/jsx-filename-extension': 'off', // .tsx already enforced

      // ===== TEMPORARY WARNINGS FOR MIGRATION =====
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',

      // ===== DISABLED FOR CURRENT PROJECT STATE =====
      'react-refresh/only-export-components': 'off',
    },
  },

  // Configuração específica para arquivos de teste
  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      '**/setup-tests.ts',
      '**/test-utils.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-console': 'off',
      'no-empty': 'off',
      'security/detect-eval-with-expression': 'off',
      'react/no-array-index-key': 'off',
      'prefer-destructuring': 'off',
      'react/function-component-definition': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
])
