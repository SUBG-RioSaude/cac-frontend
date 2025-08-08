# Documento de Design do Sistema - CAC Frontend

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Stack Tecnológica](#arquitetura-e-stack-tecnológica)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Sistema de Componentes](#sistema-de-componentes)
5. [Páginas e Rotas](#páginas-e-rotas)
6. [Padrões de Design](#padrões-de-design)
7. [Configurações e Ferramentas](#configurações-e-ferramentas)
8. [Diretrizes de Desenvolvimento](#diretrizes-de-desenvolvimento)

---

## 🎯 Visão Geral do Sistema

O **CAC Frontend** é um sistema de gerenciamento de contratos desenvolvido em React com TypeScript, focado em fornecer uma interface moderna, acessível e responsiva para o controle e administração de contratos públicos.

### Objetivos do Sistema
- Gerenciamento completo de contratos
- Controle de fornecedores
- Administração de unidades
- Interface intuitiva e acessível
- Performance otimizada
- Código tipado e manutenível

---

## 🏗️ Arquitetura e Stack Tecnológica

### Stack Principal

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.1.0 | Framework principal para UI |
| **TypeScript** | 5.8.3 | Tipagem estática |
| **Vite** | 7.0.4 | Build tool e dev server |
| **TailwindCSS** | 4.1.11 | Framework CSS utility-first |
| **React Router DOM** | 6.28.1 | Roteamento da aplicação |
| **Zustand** | 5.0.7 | Gerenciamento de estado global |

### Bibliotecas de UI/UX

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| **shadcn/ui** | - | Sistema de componentes |
| **Radix UI** | ^1.x.x | Primitivos acessíveis |
| **Lucide React** | ^0.536.0 | Ícones SVG |
| **Class Variance Authority** | ^0.7.1 | APIs de componentes |
| **Tailwind Merge** | ^3.3.1 | Merge inteligente de classes |

### Formulários e Validação

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| **React Hook Form** | ^7.62.0 | Formulários performáticos |
| **Zod** | ^4.0.14 | Validação de schema |
| **Hookform Resolvers** | ^5.2.1 | Resolvers para React Hook Form |

### Ferramentas de Desenvolvimento

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **ESLint** | ^9.30.1 | Linter |
| **Prettier** | ^3.6.2 | Formatador de código |
| **Vitest** | ^3.2.4 | Framework de testes |
| **Testing Library** | ^16.3.0 | Testes de componentes |

---

## 📁 Estrutura do Projeto

```
cac-frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── app-sidebar.tsx  # Sidebar principal
│   │   ├── nav-main.tsx     # Navegação principal
│   │   ├── nav-user.tsx     # Navegação do usuário
│   │   └── page-breadcrumb.tsx # Breadcrumb das páginas
│   ├── pages/               # Páginas da aplicação
│   │   ├── inicial/         # Página inicial
│   │   ├── contratos/       # Páginas de contratos
│   │   └── fornecedores/    # Páginas de fornecedores
│   ├── hooks/               # Hooks customizados
│   ├── lib/                 # Utilitários e configurações
│   ├── tests/               # Configuração de testes
│   └── assets/              # Recursos estáticos
├── public/                  # Arquivos públicos
├── components.json          # Configuração shadcn/ui
├── vite.config.ts          # Configuração Vite
├── tsconfig.json           # Configuração TypeScript
└── package.json            # Dependências do projeto
```

---

## 🧩 Sistema de Componentes

### Componentes de Layout

#### 1. AppSidebar (`src/components/app-sidebar.tsx`)
**Propósito:** Sidebar principal da aplicação com navegação e informações do usuário.

**Características:**
- Design responsivo com tema escuro
- Logo da prefeitura
- Navegação principal com ícones
- Informações do usuário no footer
- Suporte a submenus colapsíveis

**Estrutura:**
```typescript
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  // Props do componente Sidebar
}

const data = {
  user: {
    name: string
    email: string
    avatar: string
  }
  navMain: Array<{
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: Array<{
      title: string
      url: string
    }>
  }>
}
```

#### 2. NavMain (`src/components/nav-main.tsx`)
**Propósito:** Componente de navegação principal com suporte a submenus.

**Características:**
- Navegação hierárquica
- Submenus colapsíveis
- Ícones para cada item
- Integração com React Router

#### 3. NavUser (`src/components/nav-user.tsx`)
**Propósito:** Componente de navegação do usuário com dropdown de opções.

**Características:**
- Avatar do usuário
- Informações do perfil
- Menu dropdown com opções
- Suporte a temas

#### 4. PageBreadcrumb (`src/components/page-breadcrumb.tsx`)
**Propósito:** Breadcrumb dinâmico baseado na rota atual.

**Características:**
- Geração automática de breadcrumbs
- Suporte a rotas dinâmicas
- Navegação hierárquica
- Integração com React Router

### Componentes UI (shadcn/ui)

#### Componentes Básicos

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Button** | `ui/button.tsx` | Botão com variantes e tamanhos |
| **Card** | `ui/card.tsx` | Container de conteúdo com header, content e footer |
| **Input** | `ui/input.tsx` | Campo de entrada de texto |
| **Label** | `ui/label.tsx` | Rótulo para campos de formulário |
| **Avatar** | `ui/avatar.tsx` | Avatar de usuário |
| **Badge** | `ui/badge.tsx` | Badge para status e categorias |

#### Componentes de Navegação

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Sidebar** | `ui/sidebar.tsx` | Sidebar responsiva e acessível |
| **Breadcrumb** | `ui/breadcrumb.tsx` | Navegação breadcrumb |
| **Navigation Menu** | `ui/navigation-menu.tsx` | Menu de navegação |
| **Tabs** | `ui/tabs.tsx` | Abas de conteúdo |

#### Componentes de Formulário

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Form** | `ui/form.tsx` | Formulário com validação |
| **Select** | `ui/select.tsx` | Campo de seleção |
| **Checkbox** | `ui/checkbox.tsx` | Checkbox |
| **Radio Group** | `ui/radio-group.tsx` | Grupo de radio buttons |
| **Switch** | `ui/switch.tsx` | Switch toggle |
| **Textarea** | `ui/textarea.tsx` | Área de texto |

#### Componentes de Feedback

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Alert** | `ui/alert.tsx` | Alertas e notificações |
| **Dialog** | `ui/dialog.tsx` | Modal dialog |
| **Toast** | `ui/sonner.tsx` | Notificações toast |
| **Progress** | `ui/progress.tsx` | Barra de progresso |
| **Skeleton** | `ui/skeleton.tsx` | Loading skeleton |

#### Componentes de Dados

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Table** | `ui/table.tsx` | Tabela de dados |
| **Pagination** | `ui/pagination.tsx` | Paginação |
| **Chart** | `ui/chart.tsx` | Gráficos com Recharts |
| **Calendar** | `ui/calendar.tsx` | Calendário |
| **Carousel** | `ui/carousel.tsx` | Carrossel |

#### Componentes de Layout

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **Separator** | `ui/separator.tsx` | Separador visual |
| **Scroll Area** | `ui/scroll-area.tsx` | Área com scroll |
| **Collapsible** | `ui/collapsible.tsx` | Conteúdo colapsível |
| **Accordion** | `ui/accordion.tsx` | Acordeão |
| **Sheet** | `ui/sheet.tsx` | Painel lateral |

---

## 📄 Páginas e Rotas

### Estrutura de Rotas

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/contratos" element={<ContratosPage />} />
  <Route path="/contratos/:contratoId" element={<ContratoDetailPage />} />
  <Route path="/fornecedores" element={<FornecedoresPage />} />
  <Route path="/fornecedores/:fornecedorId" element={<FornecedorDetailPage />} />
</Routes>
```

### Páginas Implementadas

#### 1. HomePage (`src/pages/inicial/HomePage.tsx`)
**Rota:** `/`
**Status:** Implementada (básica)
**Descrição:** Página inicial do sistema

**Características:**
- Título "Início"
- Layout básico
- Preparada para expansão

#### 2. ContratosPage (`src/pages/contratos/ContratosPage.tsx`)
**Rota:** `/contratos`
**Status:** Implementada (básica)
**Descrição:** Lista de contratos

**Características:**
- Placeholder para lista de contratos
- Preparada para implementação completa

#### 3. ContratoDetailPage (`src/pages/contratos/ContratoDetailPage.tsx`)
**Rota:** `/contratos/:contratoId`
**Status:** Implementada (básica)
**Descrição:** Detalhes de um contrato específico

**Características:**
- Recebe parâmetro `contratoId`
- Placeholder para detalhes do contrato
- Preparada para implementação completa

#### 4. FornecedoresPage (`src/pages/fornecedores/FornecedoresPage.tsx`)
**Rota:** `/fornecedores`
**Status:** Implementada (básica)
**Descrição:** Lista de fornecedores

**Características:**
- Placeholder para lista de fornecedores
- Preparada para implementação completa

#### 5. FornecedorDetailPage (`src/pages/fornecedores/FornecedorDetailPage.tsx`)
**Rota:** `/fornecedores/:fornecedorId`
**Status:** Implementada (básica)
**Descrição:** Detalhes de um fornecedor específico

**Características:**
- Recebe parâmetro `fornecedorId`
- Placeholder para detalhes do fornecedor
- Preparada para implementação completa

---

## 🎨 Padrões de Design

### Design System

#### Cores e Temas
- **Base Color:** Neutral
- **Estilo:** New York (shadcn/ui)
- **Suporte a Tema Escuro:** Sim
- **Variáveis CSS:** Habilitadas

#### Tipografia
- **Fonte Principal:** System fonts
- **Hierarquia:** Baseada em tamanhos do TailwindCSS
- **Legibilidade:** Otimizada para acessibilidade

#### Espaçamento
- **Sistema:** Baseado no TailwindCSS
- **Consistência:** Padrão de 4px (0.25rem)
- **Responsividade:** Adaptável a diferentes telas

### Componentes Design Patterns

#### 1. Layout Patterns
- **Sidebar Layout:** Navegação lateral fixa
- **Header Layout:** Breadcrumb e informações de contexto
- **Content Layout:** Área principal com padding consistente

#### 2. Navigation Patterns
- **Hierarchical Navigation:** Menu principal com submenus
- **Breadcrumb Navigation:** Navegação contextual
- **User Navigation:** Dropdown com opções do usuário

#### 3. Form Patterns
- **Form Validation:** Validação com Zod
- **Form Layout:** Campos organizados em cards
- **Form Feedback:** Alertas e mensagens de erro

#### 4. Data Display Patterns
- **Table Display:** Tabelas responsivas
- **Card Display:** Informações em cards
- **List Display:** Listas com ações

---

## ⚙️ Configurações e Ferramentas

### Configuração do Vite
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup-tests.ts',
  },
})
```

### Configuração do TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Configuração do shadcn/ui
```json
// components.json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Scripts Disponíveis
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest"
  }
}
```

---

## 📋 Diretrizes de Desenvolvimento

### Padrões de Código

#### 1. Nomenclatura
- **Idioma:** Português brasileiro
- **Variáveis:** camelCase descritivo
- **Componentes:** PascalCase
- **Arquivos:** kebab-case
- **Pastas:** kebab-case

#### 2. Estrutura de Componentes
```typescript
// Padrão de componente
import { cn } from '@/lib/utils'

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

#### 3. Estilização
- **TailwindCSS:** Exclusivamente
- **CSS Customizado:** Proibido (exceto casos especiais)
- **Classes Condicionais:** Sintaxe `class:` preferida
- **Responsividade:** sm, md, lg

#### 4. Acessibilidade
- **Semântica HTML:** Sempre
- **ARIA Labels:** Quando necessário
- **Keyboard Navigation:** Suporte completo
- **Screen Readers:** Compatibilidade

#### 5. Performance
- **Lazy Loading:** Para componentes pesados
- **Memoização:** Quando apropriado
- **Bundle Splitting:** Automático com Vite
- **Code Splitting:** Por rota

### Testes

#### Estrutura de Testes
```typescript
// Padrão de teste
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Component } from './Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

#### Cobertura de Testes
- **Componentes:** Testes unitários obrigatórios
- **Hooks:** Testes de comportamento
- **Utilitários:** Testes de lógica
- **Integração:** Testes de fluxo

### Estado Global

#### Zustand Store
```typescript
// Padrão de store
import { create } from 'zustand'

interface AppState {
  // Estado
  // Ações
}

export const useAppStore = create<AppState>((set) => ({
  // Implementação
}))
```

#### Regras de Estado
- **Local First:** Estado local quando possível
- **Global Justificado:** Apenas quando necessário
- **Imutabilidade:** Sempre
- **Tipagem:** Completa

---

## 🚀 Próximos Passos

### Implementações Pendentes

1. **Páginas Completas**
   - Implementar funcionalidades completas das páginas
   - Adicionar formulários de cadastro
   - Implementar listagens com filtros

2. **Integração com API**
   - Configurar serviços de API
   - Implementar autenticação
   - Adicionar tratamento de erros

3. **Funcionalidades Avançadas**
   - Sistema de notificações
   - Relatórios e gráficos
   - Exportação de dados

4. **Melhorias de UX**
   - Animações e transições
   - Feedback visual
   - Loading states

5. **Testes**
   - Cobertura completa de testes
   - Testes de integração
   - Testes E2E

---

## 📚 Recursos e Documentação

### Links Úteis
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

### Ferramentas de Desenvolvimento
- **IDE:** VS Code com extensões recomendadas
- **Versionamento:** Git com Conventional Commits
- **Deploy:** Configuração pendente
- **CI/CD:** Configuração pendente

---

*Este documento será atualizado conforme o projeto evolui e novas funcionalidades são implementadas.* 