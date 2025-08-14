# 🏗️ Estrutura Global do Projeto - CAC Frontend

## 📋 Visão Geral

Este documento apresenta a estrutura completa do projeto **CAC Frontend**, um sistema de gerenciamento de contratos construído com React, TypeScript, Vite e TailwindCSS.

## 🗂️ Estrutura de Pastas Raiz

```
cac-frontend/
├── 📁 .git/                           # Controle de versão Git
├── 📁 .cursor/                        # Configurações do Cursor IDE
├── 📁 node_modules/                   # Dependências do projeto
├── 📁 public/                         # Arquivos públicos estáticos
├── 📁 src/                            # Código fonte principal
├── 📄 .gitignore                      # Arquivos ignorados pelo Git
├── 📄 .prettierignore                 # Arquivos ignorados pelo Prettier
├── 📄 .prettierrc                     # Configuração do Prettier
├── 📄 components.json                 # Configuração do shadcn/ui
├── 📄 DESIGN_SYSTEM.md                # Sistema de design do projeto
├── 📄 eslint.config.js                # Configuração do ESLint
├── 📄 index.html                      # Página HTML principal
├── 📄 package.json                    # Dependências e scripts
├── 📄 pnpm-lock.yaml                  # Lock file do pnpm
├── 📄 pnpm-workspace.yaml             # Configuração do workspace pnpm
├── 📄 README.md                       # Documentação principal
├── 📄 tsconfig.app.json               # Configuração TypeScript da aplicação
├── 📄 tsconfig.json                   # Configuração TypeScript base
├── 📄 tsconfig.node.json              # Configuração TypeScript do Node
└── 📄 vite.config.ts                  # Configuração do Vite
```

## 🔧 Configurações do Projeto

### **TypeScript**
- **`tsconfig.json`** - Configuração base com referências modulares
- **`tsconfig.app.json`** - Configuração específica da aplicação
- **`tsconfig.node.json`** - Configuração para ferramentas Node.js

### **Build e Desenvolvimento**
- **`vite.config.ts`** - Configuração do Vite com plugins React e TailwindCSS
- **`components.json`** - Configuração do shadcn/ui para componentes

### **Qualidade de Código**
- **`eslint.config.js`** - Regras de linting e formatação
- **`.prettierrc`** - Configuração de formatação automática
- **`.prettierignore`** - Arquivos ignorados na formatação

## 📁 Estrutura do Código Fonte (`src/`)

```
src/
├── 📁 assets/                         # Recursos estáticos
│   └── react.svg                      # Logo do React
├── 📁 components/                     # Componentes globais
│   ├── 📁 ui/                        # Componentes shadcn/ui
│   ├── app-sidebar.tsx               # Sidebar principal da aplicação
│   ├── layout-pagina.tsx             # Layout base das páginas
│   ├── nav-main.tsx                  # Navegação principal
│   ├── nav-user.tsx                  # Navegação do usuário
│   ├── page-breadcrumb.tsx           # Breadcrumb das páginas
│   └── sidebar-footer.tsx            # Rodapé da sidebar
├── 📁 hooks/                         # Hooks customizados
│   └── use-mobile.ts                 # Hook para detecção mobile
├── 📁 lib/                           # Utilitários e configurações
│   ├── 📁 __tests__/                 # Testes dos utilitários
│   ├── utils.ts                      # Funções utilitárias globais
│   └── versao.ts                     # Informações de versão
├── 📁 modules/                       # Módulos da aplicação
│   ├── 📁 Contratos/                 # Módulo de gerenciamento de contratos
│   └── 📁 Fornecedores/              # Módulo de fornecedores
├── 📁 pages/                         # Páginas principais
│   ├── 📁 contratos/                 # Páginas de contratos
│   ├── 📁 fornecedores/              # Páginas de fornecedores
│   └── 📁 inicial/                   # Páginas iniciais
├── 📁 tests/                         # Configuração de testes
├── 📄 App.tsx                        # Componente raiz da aplicação
├── 📄 index.css                      # Estilos globais e TailwindCSS
├── 📄 main.tsx                       # Ponto de entrada da aplicação
└── 📄 vite-env.d.ts                  # Tipos do Vite
```

## 🎨 Sistema de Componentes (`src/components/`)

### **Componentes Globais**
- **`app-sidebar.tsx`** - Sidebar principal com navegação
- **`layout-pagina.tsx`** - Layout base para todas as páginas
- **`nav-main.tsx`** - Menu de navegação principal
- **`nav-user.tsx`** - Menu do usuário logado
- **`page-breadcrumb.tsx`** - Navegação breadcrumb
- **`sidebar-footer.tsx`** - Rodapé da sidebar

### **Componentes UI (`src/components/ui/`)**
Sistema completo de componentes baseado no shadcn/ui:

#### **Formulários e Entrada**
- `accordion.tsx` - Acordeão expansível
- `button.tsx` - Botões com variantes
- `checkbox.tsx` - Checkbox customizado
- `input.tsx` - Campo de entrada
- `input-otp.tsx` - Entrada de códigos OTP
- `label.tsx` - Rótulos de formulário
- `radio-group.tsx` - Grupo de radio buttons
- `select.tsx` - Seleção dropdown
- `switch.tsx` - Switch toggle
- `textarea.tsx` - Área de texto
- `toggle.tsx` - Botão toggle
- `toggle-group.tsx` - Grupo de toggles

#### **Layout e Navegação**
- `breadcrumb.tsx` - Navegação breadcrumb
- `card.tsx` - Cartões de conteúdo
- `collapsible.tsx` - Conteúdo colapsável
- `command.tsx` - Menu de comandos
- `context-menu.tsx` - Menu de contexto
- `dialog.tsx` - Modais e diálogos
- `drawer.tsx` - Gavetas laterais
- `dropdown-menu.tsx` - Menu dropdown
- `hover-card.tsx` - Cartões com hover
- `menubar.tsx` - Barra de menu
- `navigation-menu.tsx` - Menu de navegação
- `popover.tsx` - Popovers informativos
- `resizable.tsx` - Painéis redimensionáveis
- `scroll-area.tsx` - Área com scroll customizado
- `separator.tsx` - Separadores visuais
- `sheet.tsx` - Painéis deslizantes
- `sidebar.tsx` - Sidebar customizada
- `tabs.tsx` - Abas de conteúdo

#### **Exibição de Dados**
- `alert.tsx` - Alertas e notificações
- `alert-dialog.tsx` - Diálogos de alerta
- `aspect-ratio.tsx` - Controle de proporção
- `avatar.tsx` - Avatares de usuário
- `badge.tsx` - Badges e etiquetas
- `calendar.tsx` - Calendário interativo
- `carousel.tsx` - Carrossel de imagens
- `chart.tsx` - Gráficos e visualizações
- `pagination.tsx` - Paginação
- `progress.tsx` - Barras de progresso
- `skeleton.tsx` - Placeholders de carregamento
- `slider.tsx` - Controles deslizantes
- `sonner.tsx` - Sistema de toast
- `steps.tsx` - Indicadores de etapas
- `table.tsx` - Tabelas de dados
- `tooltip.tsx` - Tooltips informativos

## 🏗️ Módulos da Aplicação (`src/modules/`)

### **Módulo Contratos (`src/modules/Contratos/`)**
Sistema completo de gerenciamento de contratos:

```
Contratos/
├── 📁 components/                     # Componentes específicos
│   ├── 📁 CadastroDeContratos/       # Formulários de cadastro
│   ├── 📁 ListaContratos/            # Listagem e filtros
│   └── 📁 VisualizacaoContratos/     # Visualização detalhada
├── 📁 data/                          # Dados mock consolidados
├── 📁 pages/                         # Páginas do módulo
├── 📁 store/                         # Estado global (Zustand)
├── 📁 types/                         # Definições TypeScript
├── 📁 contratos/                     # Páginas legadas
├── 📖 README.md                      # Documentação do módulo
└── 📊 ESTRUTURA.md                   # Estrutura detalhada
```

### **Módulo Fornecedores (`src/modules/Fornecedores/`)**
Sistema de gerenciamento de fornecedores (em desenvolvimento)

## 🌐 Páginas Principais (`src/pages/`)

### **Páginas de Contratos**
- **`ContratosPage.tsx`** - Lista principal de contratos
- **`ContratoDetailPage.tsx`** - Detalhes de um contrato específico

### **Páginas de Fornecedores**
- **`FornecedoresPage.tsx`** - Lista de fornecedores
- **`FornecedorDetailPage.tsx`** - Detalhes de um fornecedor

### **Páginas Iniciais**
- **`HomePage.tsx`** - Página inicial do sistema

## 🛠️ Utilitários e Configurações (`src/lib/`)

### **Funções Utilitárias (`utils.ts`)**
- Funções de formatação e validação
- Utilitários para CNPJ
- Helpers de manipulação de dados
- Funções de formatação de moeda e datas

### **Informações de Versão (`versao.ts`)**
- Controle de versão da aplicação
- Informações de build e release

## 🧪 Sistema de Testes (`src/tests/`)

### **Configuração de Testes**
- **`setup-tests.ts`** - Configuração global dos testes
- **`App.test.tsx`** - Testes do componente principal
- **Testes específicos** para cada componente

### **Frameworks de Teste**
- **Vitest** - Framework de testes unitários
- **React Testing Library** - Biblioteca para testes de componentes
- **JSDOM** - Ambiente DOM para testes

## 📁 Recursos Públicos (`public/`)

### **Logos e Imagens**
- **`logo certa.png`** - Logo principal da CAC
- **`logos-cac/`** - Conjunto de logos da CAC
  - `1.png` a `5.png` - Diferentes versões do logo

### **Ícones e SVGs**
- **`vite.svg`** - Logo do Vite

## 🔄 Fluxo da Aplicação

```
1. 📱 main.tsx                    # Ponto de entrada
   ↓
2. 🎯 App.tsx                     # Componente raiz
   ↓
3. 🧭 Layout                      # Estrutura base
   ↓
4. 📄 Páginas                     # Conteúdo específico
   ↓
5. 🔧 Componentes                 # Interface do usuário
   ↓
6. 💾 Módulos                     # Lógica de negócio
   ↓
7. 🗃️ Store                      # Estado global
```

## 🚀 Scripts Disponíveis

### **Desenvolvimento**
```bash
pnpm dev              # Servidor de desenvolvimento
pnpm build            # Build de produção
pnpm preview          # Preview do build
```

### **Qualidade de Código**
```bash
pnpm lint             # Executar ESLint
pnpm format           # Formatar com Prettier
pnpm format:check     # Verificar formatação
```

### **Testes**
```bash
pnpm test             # Executar testes
pnpm test:ui          # Interface visual de testes
pnpm test:coverage    # Relatório de cobertura
```

## 🎨 Sistema de Design

### **Frameworks CSS**
- **TailwindCSS 4.1.11** - Framework utility-first
- **shadcn/ui** - Sistema de componentes baseado em Radix UI
- **Radix UI** - Primitivos de componentes acessíveis

### **Tema e Cores**
- Sistema de cores consistente
- Suporte a temas claro/escuro
- Variáveis CSS customizadas
- Estilo "New York" do shadcn/ui

## 📱 Responsividade

### **Breakpoints**
- **sm** - 640px (mobile)
- **md** - 768px (tablet)
- **lg** - 1024px (desktop)

### **Componentes Adaptativos**
- Layout responsivo para todos os dispositivos
- Navegação adaptativa
- Tabelas com scroll horizontal em mobile
- Formulários otimizados para touch

## 🔒 Acessibilidade (A11y)

### **Padrões Implementados**
- Atributos ARIA apropriados
- Navegação por teclado
- Suporte a leitores de tela
- Contraste adequado
- Foco visual claro

## 📊 Arquitetura do Estado

### **Gerenciamento de Estado**
- **Zustand** - Store global para estado compartilhado
- **React Hooks** - Estado local dos componentes
- **Context API** - Para temas e configurações

### **Padrões de Estado**
- Estado local para componentes isolados
- Estado global apenas quando necessário
- Separação clara entre UI e lógica de negócio

## 🔌 Integração e APIs

### **Preparação para APIs**
- Dados mock em formato JSON
- Estrutura preparada para endpoints REST
- Tipos TypeScript para contratos de API
- Padrões de nomenclatura consistentes

## 📈 Monitoramento e Performance

### **Ferramentas de Build**
- **Vite** - Build tool ultra-rápido
- **SWC** - Compilador Rust para React
- **Tree shaking** automático
- **Code splitting** inteligente

### **Otimizações**
- Lazy loading de componentes
- Bundle splitting por rota
- Compressão de assets
- Cache otimizado

## 🚧 Desenvolvimento e Manutenção

### **Padrões de Código**
- **TypeScript** para tipagem estática
- **ESLint** para qualidade de código
- **Prettier** para formatação consistente
- **Conventional Commits** para mensagens Git

### **Estrutura de Branches**
- **main** - Código de produção
- **develop** - Desenvolvimento ativo
- **feature/** - Novas funcionalidades
- **hotfix/** - Correções urgentes

---

*📚 Esta documentação deve ser atualizada sempre que houver mudanças significativas na estrutura do projeto.*
