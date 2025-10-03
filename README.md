# CAC Frontend

Sistema de gestão de contratos desenvolvido com React + TypeScript + Vite, implementando um workflow enterprise com testes automatizados, commits padronizados e qualidade de código garantida.

## 🚀 Início Rápido

```bash
# Instalar dependências
pnpm install

# Configurar hooks do Git
pnpm prepare

# Iniciar desenvolvimento
pnpm dev
```

## 🎯 Features Enterprise

### ✅ Sistema de Testes Robusto

- **1.651+ testes passando** distribuídos em **93 arquivos**
- **Cobertura de código:** 85% branches, 90% functions/lines/statements
- **Testing Library** para testes focados no usuário
- **Vitest** com configuração otimizada para performance

### 🔄 Workflow de Desenvolvimento Moderno

- **Conventional Commits** com Commitizen para padronização
- **Git Hooks automatizados** com Husky para qualidade
- **ESLint + Prettier** configurado com Airbnb TypeScript
- **Pre-commit/Pre-push** hooks para validação automática

### 🏗️ Arquitetura Modular

- **Domain-Driven Design** com módulos por contexto de negócio
- **Componentes shadcn/ui** com sistema de design consistente
- **TanStack Query** para gerenciamento de estado server
- **Sistema de fallback** automático para APIs

## 📋 Índice

- [Início Rápido](#-início-rápido)
- [Features Enterprise](#-features-enterprise)
- [Desenvolvimento](#-desenvolvimento)
- [Workflow de Commits](#-workflow-de-commits)
- [Sistema de Testes](#-sistema-de-testes)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Scripts Disponíveis](#-scripts-disponíveis)

## 💻 Desenvolvimento

### Comandos Principais

```bash
# Desenvolvimento
pnpm dev                    # Servidor de desenvolvimento
pnpm build                  # Build de produção + verificação TypeScript
pnpm preview                # Preview do build

# Qualidade de Código
pnpm lint                   # ESLint com auto-fix
pnpm format                 # Prettier para formatação
pnpm format:check           # Verificar formatação

# Testes
pnpm test                   # Executar todos os testes
pnpm test:run               # Testes em modo CI
pnpm test:coverage          # Relatório de cobertura
pnpm test:ui                # Interface visual para testes
pnpm test src/path/         # Testes específicos

# Git Workflow
pnpm commit                 # Commit assistido com Commitizen
```

### Ambiente de Desenvolvimento

- **Node.js** 18+ (recomendado 20+)
- **pnpm** como package manager obrigatório
- **VS Code** com extensões recomendadas (ESLint, Prettier, Conventional Commits)

## 📝 Workflow de Commits

### Commitizen Integrado

Ao invés de `git commit`, use sempre:

```bash
pnpm commit
```

Isso abrirá um wizard interativo que garante commits padronizados seguindo **Conventional Commits**.

### Tipos de Commit Disponíveis

| Tipo       | Descrição           | Exemplo                                |
| ---------- | ------------------- | -------------------------------------- |
| `feat`     | Nova funcionalidade | `feat(auth): implementa 2FA`           |
| `fix`      | Correção de bug     | `fix(forms): valida CNPJ corretamente` |
| `docs`     | Documentação        | `docs: atualiza README`                |
| `test`     | Testes              | `test(ui): adiciona testes do botão`   |
| `refactor` | Refatoração         | `refactor: otimiza hooks customizados` |
| `perf`     | Performance         | `perf: melhora renderização da tabela` |
| `style`    | Formatação          | `style: aplica prettier`               |
| `chore`    | Manutenção          | `chore: atualiza dependências`         |

### Git Hooks Automatizados

**Pre-commit:**

- ✅ ESLint com auto-fix
- ✅ Prettier para formatação
- ✅ Aplicado apenas em arquivos modificados

**Commit-msg:**

- ✅ Validação de mensagem Conventional Commits
- ✅ Bloqueia commits fora do padrão

**Pre-push:**

- ✅ Build completo do TypeScript
- ✅ Execução de todos os testes
- ✅ Bloqueia push se houver falhas

## 🧪 Sistema de Testes

### Estatísticas do Projeto

- **93 arquivos de teste**
- **1.651+ testes passando**
- **99.2% taxa de sucesso**
- **Cobertura Enterprise:** 85%+ branches, 90%+ functions/lines/statements

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes específicos
pnpm test src/components/ui/__tests__/button.test.tsx
pnpm test src/modules/Dashboard

# Com cobertura
pnpm test:coverage

# Interface visual
pnpm test:ui
```

### Estrutura de Testes

Cada módulo possui seus testes organizados em `__tests__/`:

```
src/modules/Contratos/
├── components/
│   └── __tests__/
├── pages/
│   └── __tests__/
├── hooks/
│   └── __tests__/
└── services/
    └── __tests__/
```

### Stack de Testes

- **Vitest** - Framework de testes rápido
- **Testing Library** - Testes focados no usuário
- **JSDOM** - Simulação de browser
- **MSW** - Mock de APIs (quando necessário)

## 🏗️ Arquitetura

### Estrutura Modular por Domínio

```
src/
├── modules/                 # Módulos de negócio
│   ├── Contratos/          # 📄 Gestão de contratos
│   ├── Fornecedores/       # 🏢 Gestão de fornecedores
│   ├── Unidades/           # 🏭 Gestão de unidades
│   ├── Funcionarios/       # 👥 Gestão de funcionários
│   └── Dashboard/          # 📊 Dashboard principal
├── components/             # 🧩 Componentes globais
│   └── ui/                 # 🎨 Sistema de design
├── lib/                    # 🛠️ Utilitários e configs
│   ├── auth/               # 🔐 Sistema de autenticação
│   ├── utils.ts            # 🔧 Utilitários (CNPJ, etc.)
│   └── axios.ts            # 🌐 HTTP com fallback
├── hooks/                  # 🎣 Hooks customizados
└── pages/                  # 📱 Páginas de rota
```

### Módulo Padrão

Cada módulo segue estrutura consistente:

```
ModuloExemplo/
├── components/         # Componentes específicos
├── pages/             # Páginas do módulo
├── hooks/             # Hooks específicos
├── services/          # Serviços de API
├── utils/             # Utilitários do módulo
├── types/             # Tipos TypeScript
└── __tests__/         # Testes do módulo
```

### Sistema de Autenticação

- **JWT Tokens** com renovação automática
- **2FA obrigatório** via código por email
- **Guards de rota** para proteção
- **Middleware** para fluxos de autenticação

## 🛠️ Stack Tecnológica

### Core

- **React 19.1.0** - Framework frontend
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 7.0.4** - Build tool ultra-rápido
- **TailwindCSS 4.1.11** - Framework CSS utility-first

### UI & Design

- **shadcn/ui** - Sistema de componentes (estilo New York)
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Ícones SVG
- **Framer Motion** - Animações fluidas

### Estado & Dados

- **TanStack Query 5.85.5** - Estado server e cache
- **Zustand 5.0.7** - Estado global (quando necessário)
- **React Hook Form 7.62.0** - Formulários performáticos
- **Zod 4.0.14** - Validação de schema

### Qualidade & Testes

- **Vitest 3.2.4** - Framework de testes
- **Testing Library** - Testes de componentes
- **ESLint 9.30.1** - Linting (Airbnb + Security)
- **Prettier 3.6.2** - Formatação de código

### DevOps & Workflow

- **Husky 9.1.7** - Git hooks
- **Commitizen 4.3.1** - Commits padronizados
- **Commitlint 19.8.1** - Validação de commits
- **lint-staged 16.1.6** - Linting incremental

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
pnpm dev              # Servidor de desenvolvimento
pnpm build            # Build de produção
pnpm preview          # Preview do build
```

### Qualidade

```bash
pnpm lint             # ESLint com auto-fix
pnpm format           # Formatação com Prettier
pnpm format:check     # Verificar formatação
```

### Testes

```bash
pnpm test             # Todos os testes
pnpm test:run         # Testes modo CI
pnpm test:coverage    # Com cobertura
pnpm test:ui          # Interface visual
pnpm test:watch       # Modo watch
```

### Git Workflow

```bash
pnpm commit           # Commit com Commitizen
pnpm prepare          # Configurar hooks
```

## 🔧 Configuração

### Aliases de Path

```typescript
'@/*' → './src/*'
```

### Coverage Thresholds

- **Branches:** 85%
- **Functions:** 90%
- **Lines:** 90%
- **Statements:** 90%

### ESLint Rules

- Airbnb TypeScript
- React Hooks
- Security
- Import/Export
- Accessibility (A11y)

## 🎨 Sistema de Design

### Componentes Base

- **Button System** com variantes (CVA)
- **Status Badges** universais por domínio
- **Form Components** com validação
- **Loading States** padronizados

### Padrões de Cores

- **Contratos:** ativo (verde), vencendo (amarelo), vencido (vermelho)
- **Fornecedores:** ativo (verde), inativo (cinza), suspenso (laranja)
- **Status Universal** com fallbacks seguros

### Utilitários Específicos

```typescript
// Validação e formatação brasileira
cnpjUtils.validate()
cnpjUtils.format()
cepUtils.validate()
currencyUtils.format()
dateUtils.formatUTC()
```

---

## 🔗 Links Úteis

- **Conventional Commits:** [conventionalcommits.org](https://www.conventionalcommits.org/)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com/)
- **TailwindCSS:** [tailwindcss.com](https://tailwindcss.com/)
- **Vitest:** [vitest.dev](https://vitest.dev/)
- **React Testing Library:** [testing-library.com](https://testing-library.com/)

---

**CAC Frontend** - Sistema enterprise com qualidade garantida, testes automatizados e workflow moderno para desenvolvimento ágil e seguro.
