# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager
Este projeto utiliza **pnpm exclusivamente**.


##Regras

SEMPRE programar de acordo com as regras de lint do projeto para evitar erros e redundâncias.

## Comandos principais:
- `pnpm dev` - Servidor de desenvolvimento
- `pnpm build` - Build de produção (inclui verificação TypeScript)
- `pnpm test` - Executar todos os testes
- `pnpm test:run` - Executar testes uma vez (modo CI)
- `pnpm test:coverage` - Executar testes com relatório de cobertura
- `pnpm test:ui` - Interface visual para testes
- `pnpm test:watch` - Executar testes específicos: `pnpm test src/path/to/test.tsx`
- `pnpm lint` - Executar linting com ESLint
- `pnpm format` - Formatar código com Prettier
- `pnpm format:check` - Verificar formatação sem modificar
- `pnpm commit` - Commit assistido com Commitizen
- `pnpm prepare` - Configurar hooks do Husky

## Workflow de Desenvolvimento Moderno

### Sistema de Commits com Conventional Commits
O projeto usa **Conventional Commits** com **Commitizen** para commits padronizados:

**Fluxo de commit:**
```bash
# Ao invés de git commit -m "mensagem"
pnpm commit
# Isso abrirá um wizard interativo para criar commits padronizados
```

**Tipos de commit permitidos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, sem mudança de lógica
- `refactor`: Refatoração sem nova funcionalidade ou bug fix
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `build`: Mudanças no sistema de build
- `ci`: Mudanças no CI/CD
- `chore`: Tarefas de manutenção
- `revert`: Reversão de commit
- `hotfix`: Correção crítica
- `wip`: Work in progress

### Git Hooks Automatizados
**Pre-commit (via Husky + lint-staged):**
- Executa ESLint com correções automáticas
- Formata código com Prettier
- Aplica apenas nos arquivos modificados

**Commit-msg:**
- Valida mensagens de commit com Commitlint
- Garante conformidade com Conventional Commits

**Pre-push:**
- Executa build completo do TypeScript
- Roda toda a suite de testes
- Bloqueia push se houver falhas

### Sistema de Testes Enterprise
- **93 arquivos de teste** com **1.651+ testes passando**
- **Cobertura configurada:** 85% branches, 90% functions/lines/statements
- **Testing Library** para testes focados no usuário
- **Vitest** com configuração otimizada para performance
- **JSDOM** para simulação de browser
- Testes organizados em `__tests__/` dentro de cada módulo

**Executar testes específicos:**
```bash
pnpm test src/components/ui/__tests__/button.test.tsx
pnpm test src/modules/Dashboard
```

## Arquitetura do Projeto

### Stack Tecnológica Principal
- **React 19.1.0** com **Vite 7.0.4** e **TypeScript 5.8.3**
- **TailwindCSS 4.1.11** com sistema de componentes **shadcn/ui** (estilo New York)
- **React Router DOM 6.28.1** para roteamento
- **TanStack Query 5.85.5** para gerenciamento de estado server
- **Zustand 5.0.7** para estado global (usar com moderação)
- **React Hook Form 7.62.0** + **Zod 4.0.14** para formulários e validação
- **Vitest 3.2.4** + **Testing Library** para testes

### Estrutura de Módulos
O projeto segue uma arquitetura modular baseada em domínios de negócio:

```
src/
├── modules/
│   ├── Contratos/           # Gestão de contratos
│   ├── Fornecedores/        # Gestão de fornecedores
│   ├── Unidades/            # Gestão de unidades
│   ├── Funcionarios/        # Gestão de funcionários
│   ├── Dashboard/           # Dashboard principal
│   └── http-codes/          # Páginas de erro HTTP
├── components/              # Componentes globais reutilizáveis
│   └── ui/                  # Componentes shadcn/ui
├── lib/                     # Utilitários, configurações e serviços
│   ├── auth/                # Sistema de autenticação
│   ├── utils.ts             # Utilitários globais (CNPJ, formatação, etc.)
│   ├── axios.ts             # Configuração HTTP com fallback
│   └── middleware.tsx       # Guards de rota e autenticação
├── hooks/                   # Hooks customizados globais
└── pages/                   # Páginas de rota principais
```

### Sistema de Autenticação
- **JWT Tokens** com **renovação automática** via refresh tokens
- **Autenticação 2FA** obrigatória via código por email
- **Guards de rota** com verificação de status de autenticação
- **Middleware personalizado** para fluxos de autenticação (login, troca de senha, etc.)
- **Store Zustand** para estado de autenticação global

### API e Comunicação
- **Axios** configurado com interceptadores automáticos
- **Sistema de Fallback** automático entre Gateway e microserviços diretos
- **Renovação automática** de tokens em requisições 401
- **Métricas de API** para monitoramento de falhas
- **TanStack Query** para cache e sincronização de dados

## Diretrizes de Desenvolvimento

### Idioma e Nomenclatura
- **Todo o código deve ser em português brasileiro** (variáveis, funções, componentes, arquivos, pastas, comentários)
- Nomes de páginas e rotas devem ser descritivos em português
- Use `handle` como prefixo para funções de evento (ex: `handleClick`)

### Estilo de Código
- **Early returns** sempre que possível
- **TailwindCSS exclusivamente** - proibido CSS tradicional ou estilos inline
- **Tipagem explícita** com TypeScript
- **Funções como constantes** (`const minhaFuncao = () => {}`)
- **Acessibilidade obrigatória** (tabindex, aria-label, onKeyDown para elementos interativos)

### Validação e Formatação
- **SEMPRE use utilitários globais** de `@/lib/utils`:
  - `cnpjUtils.*` - validação, formatação e máscara de CNPJ
  - `currencyUtils.*` - valores monetários
  - `cepUtils.*` - validação e formatação de CEP
  - `phoneUtils.*` - telefones brasileiros
  - `ieUtils.*` - Inscrição Estadual por estado
  - `percentualUtils.*` - valores percentuais
  - `dateUtils.*` - formatação segura de datas UTC

### Gerenciamento de Estado
- **TanStack Query** para estado servidor (dados da API)
- **Estado local** com useState/useReducer quando possível
- **Zustand** apenas para estado global justificado (perguntar antes de usar)
- **React Hook Form** para estado de formulários

### Testes - Práticas Obrigatórias
- **Teste unitário obrigatório** para todo componente novo
- **Localização:** `__tests__/` dentro do módulo/componente
- **Foco no comportamento do usuário**, não detalhes de implementação
- **Usar data-testid** para elementos que precisam ser testados
- **Mockar hooks complexos** (TanStack Query, etc.) nos testes de componentes
- **Configurar QueryClient** com `retry: 0` nos testes para evitar timeouts

### Módulos de Negócio
Cada módulo em `src/modules/` deve seguir estrutura consistente:
```
ModuloExemplo/
├── components/              # Componentes específicos do módulo
│   └── __tests__/           # Testes dos componentes
├── pages/                   # Páginas do módulo
│   └── __tests__/           # Testes das páginas
├── hooks/                   # Hooks específicos do módulo
│   └── __tests__/           # Testes dos hooks
├── services/                # Serviços de API do módulo
│   └── __tests__/           # Testes dos serviços
├── utils/                   # Utilitários do módulo
│   └── __tests__/           # Testes dos utilitários
├── store/                   # Estado Zustand específico (se necessário)
├── types/                   # Tipos TypeScript do módulo
└── __tests__/               # Testes gerais do módulo
```

## Convençções Específicas do Projeto

### Roteamento e Autenticação
- Usar `ProtectedRoute` para rotas que requerem autenticação
- Usar `AuthFlowGuard` para fluxos de autenticação (login, registro, etc.)
- Implementar redirecionamento automático para troca de senha obrigatória

### Formulários
- Usar React Hook Form + Zod para validação
- Aplicar utilitários de formatação e validação de `@/lib/utils`
- Componentes de formulário em `@/components/ui`

### API e Error Handling
- Usar `executeWithFallback` para requisições com fallback automático
- Implementar error boundaries para captura de erros
- Páginas de erro HTTP específicas em `src/modules/http-codes/`

### Componentes UI
- Sistema shadcn/ui configurado com estilo "New York"
- Alias configurados: `@/components`, `@/lib`, `@/hooks`
- Ícones via Lucide React

## Sistema de Design e Componentes

### Sistema de Botões
O projeto possui um sistema extenso de botões baseado em **Class Variance Authority (CVA)**:

#### Variantes Disponíveis:
- **Padrão**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Temáticas**: `success`, `warning`, `info`, `neutral`
- **Tamanhos**: `default` (h-9), `sm` (h-8), `lg` (h-10), `icon` (size-9)

#### LoadingButton Especializado:
```tsx
import { LoadingButton } from '@/components/ui/button-extended'

<LoadingButton
  loading={isSubmitting}
  loadingText="Salvando..."
  variant="success"
  onClick={handleSave}
>
  Salvar Dados
</LoadingButton>
```

### Sistema de Status Badges Universal
Sistema centralizado para badges de status em todos os domínios de negócio:

#### StatusBadge Principal:
```tsx
import { StatusBadge } from '@/components/ui/status-badge'

<StatusBadge
  status="ativo"
  domain="contrato"
  size="default"
  showIcon={true}
/>
```

#### Badges Especializados por Domínio:
```tsx
import {
  ContratoStatusBadge,
  FornecedorStatusBadge,
  UnidadeStatusBadge
} from '@/components/ui/status-badge'

<ContratoStatusBadge status="vencendo" />
<FornecedorStatusBadge status="ativo" />
<UnidadeStatusBadge status="inativo" />
```

#### Tipos de Status por Domínio:
- **Contratos**: `ativo`, `vencendo`, `vencido`, `suspenso`, `encerrado`, `indefinido`
- **Fornecedores**: `ativo`, `inativo`, `suspenso`
- **Unidades**: `ativo`, `inativo`

### Configuração de Status (useStatusConfig)
Hook centralizado para gerenciamento de status com lógica inteligente:

```tsx
import { useStatusConfig, useContratoStatus } from '@/hooks/use-status-config'

// Configuração manual
const { getStatusConfig } = useStatusConfig()
const config = getStatusConfig('ativo', 'contrato')

// Lógica automática para contratos (calcula status baseado em vigência)
const status = useContratoStatus(
  contrato.vigenciaInicial,
  contrato.vigenciaFinal,
  contrato.statusAtual
)
```

#### Características do Sistema:
- **Cores consistentes** com classes TailwindCSS padronizadas
- **Ícones integrados** do Lucide React (CheckCircle, AlertTriangle, Clock, etc.)
- **Lógica de vigência** automática para contratos (30 dias = "vencendo")
- **Fallbacks seguros** para status inválidos
- **Configuração visual centralizada** em `@/hooks/use-status-config`

#### Arquivos Principais:
- `@/components/ui/badge.tsx` - Badge base com CVA
- `@/components/ui/button.tsx` - Sistema de botões com variantes
- `@/components/ui/status-badge.tsx` - StatusBadge universal
- `@/types/status.ts` - Tipos TypeScript para status
- `@/hooks/use-status-config.ts` - Configuração e lógica de status

## Qualidade de Código e CI/CD

### ESLint Configuration
- **Config:** Airbnb TypeScript + Security + React Hooks + Import + A11y
- **Plugins:** React, React Hooks, React Refresh, Security, Import, A11y
- **Auto-fix:** Configurado no pre-commit hook

### Coverage Thresholds
- **Branches:** 85%
- **Functions:** 90%
- **Lines:** 90%
- **Statements:** 90%

### Automatic Quality Gates
- **Pre-commit:** Linting + Formatação automática
- **Pre-push:** Build + Testes completos
- **Commit-msg:** Validação de mensagem Conventional Commits

## Sessions System Behaviors

@CLAUDE.sessions.md