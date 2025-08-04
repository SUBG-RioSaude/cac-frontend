# CAC Frontend

Projeto desenvolvido em React + TypeScript + Vite com uma stack moderna e completa para desenvolvimento frontend.

## 📋 Índice

- [Tecnologias Principais](#-tecnologias-principais)
- [Sistema de Componentes UI](#-sistema-de-componentes-ui)
- [Roteamento](#-roteamento)
- [Gerenciamento de Estado](#-gerenciamento-de-estado)
- [Formulários e Validação](#-formulários-e-validação)
- [Styling e Design](#-styling-e-design)
- [Utilitários](#-utilitários)
- [Desenvolvimento e Testes](#-desenvolvimento-e-testes)
- [Scripts Disponíveis](#-scripts-disponíveis)

## 🚀 Tecnologias Principais

### React 19.1.0

Framework principal para construção da interface de usuário.

- **Documentação:** [https://react.dev/](https://react.dev/)
- **React DOM:** Renderização para navegadores web

### TypeScript 5.8.3

Superset do JavaScript que adiciona tipagem estática.

- **Documentação:** [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

### Vite 7.0.4

Build tool e dev server extremamente rápido.

- **Documentação:** [https://vitejs.dev/](https://vitejs.dev/)
- **Plugin:** `@vitejs/plugin-react-swc` para React com SWC

## 🎨 Sistema de Componentes UI

### shadcn/ui

Sistema de componentes construído sobre Radix UI e TailwindCSS.

- **Documentação:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Estilo:** New York
- **Ícones:** Lucide React

### Radix UI

Primitivos de componentes unstyled e acessíveis                                                           |
| --------------- | ------- | --------------------------------------------------------------------------- |
| Accordion       | ^1.2.11 | [Docs](https://www.radix-ui.com/primitives/docs/components/accordion)       |
| Alert Dialog    | ^1.1.14 | [Docs](https://www.radix-ui.com/primitives/docs/components/alert-dialog)    |
| Aspect Ratio    | ^1.1.7  | [Docs](https://www.radix-ui.com/primitives/docs/components/aspect-ratio)    |
| Avatar          | ^1.1.10 | [Docs](https://www.radix-ui.com/primitives/docs/components/avatar)          |
| Checkbox        | ^1.3.2  | [Docs](https://www.radix-ui.com/primitives/docs/components/checkbox)        |
| Collapsible     | ^1.1.11 | [Docs](https://www.radix-ui.com/primitives/docs/components/collapsible)     |
| Context Menu    | ^2.2.15 | [Docs](https://www.radix-ui.com/primitives/docs/components/context-menu)    |
| Dialog          | ^1.1.14 | [Docs](https://www.radix-ui.com/primitives/docs/components/dialog)          |
| Dropdown Menu   | ^2.1.15 | [Docs](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)   |
| Hover Card      | ^1.1.14 | [Docs](https://www.radix-ui.com/primitives/docs/components/hover-card)      |
| Label           | ^2.1.7  | [Docs](https://www.radix-ui.com/primitives/docs/components/label)           |
| Menubar         | ^1.1.15 | [Docs](https://www.radix-ui.com/primitives/docs/components/menubar)         |
| Navigation Menu | ^1.2.13 | [Docs](https://www.radix-ui.com/primitives/docs/components/navigation-menu) |
| Popover         | ^1.1.14 | [Docs](https://www.radix-ui.com/primitives/docs/components/popover)         |
| Progress        | ^1.1.7  | [Docs](https://www.radix-ui.com/primitives/docs/components/progress)        |
| Radio Group     | ^1.3.7  | [Docs](https://www.radix-ui.com/primitives/docs/components/radio-group)     |
| Scroll Area     | ^1.2.9  | [Docs](https://www.radix-ui.com/primitives/docs/components/scroll-area)     |
| Select          | ^2.2.5  | [Docs](https://www.radix-ui.com/primitives/docs/components/select)          |
| Separator       | ^1.1.7  | [Docs](https://www.radix-ui.com/primitives/docs/components/separator)       |
| Slider          | ^1.3.5  | [Docs](https://www.radix-ui.com/primitives/docs/components/slider)          |
| Switch          | ^1.2.5  | [Docs](https://www.radix-ui.com/primitives/docs/components/switch)          |
| Tabs            | ^1.1.12 | [Docs](https://www.radix-ui.com/primitives/docs/components/tabs)            |
| Toggle          | ^1.1.9  | [Docs](https://www.radix-ui.com/primitives/docs/components/toggle)          |
| Toggle Group    | ^1.1.10 | [Docs](https://www.radix-ui.com/primitives/docs/components/toggle-group)    |
| Tooltip         | ^1.2.7  | [Docs](https://www.radix-ui.com/primitives/docs/components/tooltip)         |

### Lucide React ^0.536.0

Biblioteca de ícones SVG limpos e personalizáveis.

- **Documentação:** [https://lucide.dev/](https://lucide.dev/)

## 🗺️ Roteamento

### TanStack Router ^1.130.12

Sistema de roteamento type-safe para React.

- **Documentação:** [https://tanstack.com/router](https://tanstack.com/router)
- **Recursos:**
  - Code splitting automático
  - DevTools incluídas
  - Type safety completa
  - Plugin Vite integrado

## 🗃️ Gerenciamento de Estado

### Zustand ^5.0.7

Biblioteca leve para gerenciamento de estado global.

- **Documentação:** [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)

## 📝 Formulários e Validação

### React Hook Form ^7.62.0

Biblioteca performática para formulários com validação mínima de re-renders.

- **Documentação:** [https://react-hook-form.com/](https://react-hook-form.com/)

### Zod ^4.0.14

Schema validation TypeScript-first.

- **Documentação:** [https://zod.dev/](https://zod.dev/)

### Hookform Resolvers ^5.2.1

Resolvers para React Hook Form com várias bibliotecas de validação.

- **Documentação:** [https://github.com/react-hook-form/resolvers](https://github.com/react-hook-form/resolvers)

## 🎨 Styling e Design

### TailwindCSS ^4.1.11

Framework CSS utility-first.

- **Documentação:** [https://tailwindcss.com/](https://tailwindcss.com/)
- **Plugin Vite:** `@tailwindcss/vite`

### Class Variance Authority ^0.7.1

Biblioteca para criar APIs de componentes com variantes.

- **Documentação:** [https://cva.style/docs](https://cva.style/docs)

### Tailwind Merge ^3.3.1

Utilitário para merge inteligente de classes TailwindCSS.

- **Documentação:** [https://github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)

### Next Themes ^0.4.6

Abstração para temas em React (dark/light mode).

- **Documentação:** [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)

### Motion ^12.23.12

Biblioteca de animações para React.

- **Documentação:** [https://motion.dev/](https://motion.dev/)

## 🛠️ Utilitários

### CLSX ^2.1.1

Utilitário para construção condicional de strings de classe.

- **Documentação:** [https://github.com/lukeed/clsx](https://github.com/lukeed/clsx)

### Date-fns ^4.1.0

Biblioteca moderna para manipulação de datas.

- **Documentação:** [https://date-fns.org/](https://date-fns.org/)

### React Day Picker ^9.8.1

Componente flexível de seleção de datas.

- **Documentação:** [https://daypicker.dev/](https://daypicker.dev/)

### Input OTP ^1.4.2

Componente para entrada de códigos OTP/PIN.

- **Documentação:** [https://input-otp.rodz.dev/](https://input-otp.rodz.dev/)

### CMDK ^1.1.1

Componente de command menu rápido e acessível.

- **Documentação:** [https://cmdk.paco.me/](https://cmdk.paco.me/)

### Embla Carousel React ^8.6.0

Biblioteca de carousel leve e extensível.

- **Documentação:** [https://www.embla-carousel.com/](https://www.embla-carousel.com/)

### React Resizable Panels ^3.0.4

Componentes de painéis redimensionáveis.

- **Documentação:** [https://github.com/bvaughn/react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)

### Recharts ^2.15.4

Biblioteca de gráficos construída com React e D3.

- **Documentação:** [https://recharts.org/](https://recharts.org/)

### Sonner ^2.0.7

Sistema de toast/notificação opinativo.

- **Documentação:** [https://sonner.emilkowal.ski/](https://sonner.emilkowal.ski/)

### Vaul ^1.1.2

Componente drawer unstyled para React.

- **Documentação:** [https://vaul.emilkowal.ski/](https://vaul.emilkowal.ski/)

## 🧪 Desenvolvimento e Testes

### Vitest ^3.2.4

Framework de testes unitários extremamente rápido.

- **Documentação:** [https://vitest.dev/](https://vitest.dev/)

### Testing Library

Suite completa para testes de componentes React:

- **React Testing Library ^16.3.0:** [Docs](https://testing-library.com/docs/react-testing-library/intro/)
- **Jest DOM ^6.6.4:** [Docs](https://github.com/testing-library/jest-dom)
- **User Event ^14.6.1:** [Docs](https://testing-library.com/docs/user-event/intro)

### ESLint ^9.30.1

Linter para identificação de problemas no código JavaScript/TypeScript.

- **Documentação:** [https://eslint.org/](https://eslint.org/)
- **Plugins:**
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-react-refresh`

### Prettier ^3.6.2

Formatador de código opinativo.

- **Documentação:** [https://prettier.io/](https://prettier.io/)
- **Plugin:** `prettier-plugin-tailwindcss` para ordenação de classes

### JSDOM ^26.1.0

Implementação JavaScript pura do DOM para testes.

- **Documentação:** [https://github.com/jsdom/jsdom](https://github.com/jsdom/jsdom)

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Compila TypeScript e gera build de produção
pnpm preview          # Preview do build de produção

# Qualidade de código
pnpm lint             # Executa ESLint
pnpm format           # Formata código com Prettier
pnpm format:check     # Verifica formatação sem modificar

# Testes
pnpm test             # Executa testes com Vitest
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   └── ui/          # Componentes shadcn/ui
├── hooks/           # Hooks customizados
├── lib/             # Utilitários e configurações
├── routes/          # Páginas e rotas
└── tests/           # Configuração de testes
```

## 🔧 Configurações

- **Path Mapping:** Configurado alias `@/*` para `./src/*`
- **TailwindCSS:** Configurado com variáveis CSS e estilo New York
- **TypeScript:** Configuração modular com referencias separadas
- **Vite:** Plugins configurados para React (SWC), TanStack Router e TailwindCSS

---

Este projeto utiliza uma stack moderna e bem estruturada, priorizando developer experience, performance e acessibilidade.
