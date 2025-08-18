# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos Essenciais

### Desenvolvimento

```bash
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Compila TypeScript e gera build de produção
pnpm preview          # Preview do build de produção
```

### Qualidade de Código

```bash
pnpm lint             # Executa ESLint
pnpm format           # Formata código com Prettier
pnpm format:check     # Verifica formatação sem modificar
```

### Testes

```bash
pnpm test             # Executa testes com Vitest
```

## Arquitetura do Projeto

### Stack Tecnológica Principal

- **React 19.1.0** com TypeScript 5.8.3
- **Vite 7.0.4** como build tool e dev server
- **TailwindCSS 4.1.11** para estilização
- **shadcn/ui** (estilo New York) com Radix UI primitives
- **React Router DOM 6.28.1** para roteamento
- **Zustand 5.0.7** para gerenciamento de estado global
- **React Hook Form 7.62.0 + Zod 4.0.14** para formulários e validação

### Estrutura do Código

#### Organização de Diretórios

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes shadcn/ui
│   ├── app-sidebar.tsx  # Sidebar principal da aplicação
│   ├── nav-main.tsx     # Navegação principal com submenus
│   ├── nav-user.tsx     # Menu dropdown do usuário
│   └── page-breadcrumb.tsx # Breadcrumb dinâmico
├── modules/             # Módulos funcionais específicos
│   ├── contratos/       # Módulo de contratos
│   │   ├── components/  # Componentes específicos do módulo
│   │   ├── pages/       # Páginas do módulo
│   │   ├── store/       # Estado específico (Zustand)
│   │   ├── types/       # Tipos TypeScript
│   │   └── data/        # Dados mock e configurações
│   └── http-codes/      # Páginas de erro HTTP (400, 401, 403, 404, 500, 503)
├── pages/               # Páginas principais da aplicação
├── hooks/               # Hooks customizados
├── lib/                 # Utilitários e configurações
└── tests/               # Configuração de testes
```

#### Sistema de Roteamento

A aplicação usa layout sidebar fixo com:

- Header fixo com breadcrumb dinâmico
- Área de conteúdo principal com scroll
- Navegação hierárquica na sidebar

**Rotas principais:**

- `/` - HomePage
- `/contratos` - Lista de contratos
- `/contratos/cadastrar` - Cadastro de contratos
- `/contratos/:id` - Detalhes do contrato
- `/contratos/:id/editar` - Edição de contratos
- `/fornecedores` - Lista de fornecedores
- `/fornecedores/:id` - Detalhes do fornecedor

#### Gerenciamento de Estado

O projeto utiliza **arquitetura modular de estado**:

- **Estado global:** Zustand para dados compartilhados (ex: `useContratosStore`)
- **Estado local:** useState/hooks para estado específico de componente
- **Formulários:** React Hook Form com validação Zod

Exemplo de store (contratos-store.ts):

- Filtros e pesquisa de contratos
- Paginação
- Seleção múltipla
- Estado reativo com ações

#### Componentes e Design System

- **shadcn/ui** configurado no estilo "New York"
- **Base color:** Neutral com suporte a CSS variables
- **Ícones:** Lucide React
- **Responsividade:** TailwindCSS breakpoints (sm, md, lg)
- **Acessibilidade:** Radix UI primitives garantem conformidade

### Padrões de Desenvolvimento

#### Nomenclatura

- **Idioma:** Português brasileiro
- **Componentes:** PascalCase
- **Arquivos:** kebab-case
- **Variáveis:** camelCase descritivo
- **Tipos:** PascalCase com sufixos descritivos

#### Estrutura de Componentes

```typescript
interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export function Component({ className, children, ...props }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      {children}
    </div>
  )
}
```

#### Estilização

- **Exclusivamente TailwindCSS** - não usar CSS customizado
- Usar `cn()` utility de `@/lib/utils` para merge de classes
- Componentes devem aceitar `className` para extensibilidade

#### Formulários

- **React Hook Form** com resolvers Zod para validação
- Componentes de formulário do shadcn/ui
- Validação client-side com feedback visual
- **Formatação monetária**: Sempre usar `currencyUtils` do `@/lib/utils` para campos de valor
  - `currencyUtils.aplicarMascara()` para inputs com máscara R$ durante digitação
  - `currencyUtils.validar()` para validação de valores monetários
  - `currencyUtils.formatar()` para exibição de valores formatados

## Configurações Importantes

### Aliases de Path

```
@/* -> ./src/*
```

### shadcn/ui

- Estilo: "new-york"
- Base color: "neutral"
- CSS Variables: habilitado
- Icon library: "lucide"

### Vite

- Plugin React com SWC
- Plugin TailwindCSS
- Configuração de testes com Vitest + jsdom

## Módulo de Contratos

O módulo principal implementado possui:

- **Cadastro de contratos** com formulários multi-step
- **Listagem com filtros avançados** e pesquisa
- **Visualização detalhada** de contratos
- **Estado reativo** com Zustand store
- **Validação robusta** com Zod schemas
- **Componentes reutilizáveis** específicos do domínio

## Sistema de Tratamento de Erros

### Páginas de Erro HTTP

- **Páginas implementadas**: 400, 401, 403, 404, 500, 503
- **Localização**: `src/modules/http-codes/`
- **Recursos**: Campo para erro técnico, botões de retry/contato admin, navegação contextual
- **Design**: Cards responsivos com shadcn/ui, ícones temáticos, cores específicas por tipo

### Hook useErrorHandler

- **Localização**: `src/hooks/use-error-handler.ts`
- **Funcionalidades**:
  - `handleError()` - redireciona para página de erro com contexto
  - `handleApiError()` - processa erros de API automaticamente
  - `handleHttpError()` - processa responses HTTP
- **Integração**: Páginas de erro recebem informações via `location.state`

## Convenções de Commit

O projeto segue **Conventional Commits** em português:

- `feat:` para novas funcionalidades
- `fix:` para correções
- `refactor:` para refatorações
- `style:` para formatação
- `test:` para testes
- Usar escopos como `(ui)`, `(auth)`, `(forms)` quando aplicável
