# 📊 Diagrama Visual da Estrutura - Módulo Fornecedores

## 🗂️ Estrutura de Pastas

```
src/modules/Fornecedores/
│
├── 📁 components/                           # 🔧 Componentes Reutilizáveis
│   ├── 📁 ListaFornecedores/               # 📋 Listagem e Filtros
│   │   ├── filtros-fornecedores.tsx        # 🔍 Filtros avançados
│   │   ├── modal-confirmacao-exportacao.tsx # 📤 Confirmação de export
│   │   ├── modal-novo-fornecedor.tsx       # ➕ Modal de cadastro
│   │   ├── search-and-filters.tsx         # 🔎 Pesquisa básica
│   │   └── tabela-fornecedores.tsx         # 📊 Tabela responsiva
│   │
│   └── 📁 VisualizacaoFornecedor/         # 👁️ Visualização Detalhada
│       ├── contatos-fornecedor.tsx        # 📞 Informações de contato
│       ├── endereco-fornecedor.tsx        # 🏠 Dados de endereço
│       ├── fornecedor-header.tsx          # 📋 Cabeçalho da página
│       ├── FornecedorContratos.tsx        # 📄 Lista de contratos
│       ├── FornecedorMetricas.tsx         # 📈 Métricas e indicadores
│       ├── FornecedorTabs.tsx             # 🗂️ Sistema de abas
│       ├── FornecedorVisaoGeral.tsx       # 👀 Visão geral
│       └── informacoes-fornecedor.tsx     # ℹ️ Informações básicas
│
├── 📁 data/                                # 💾 Dados e Configurações
│   └── fornecedores-mock.ts                # 🗃️ DADOS PRINCIPAIS (Mock)
│
├── 📁 pages/                               # 🌐 Páginas Principais
│   ├── 📁 ListaFornecedores/
│   │   └── FornecedoresPage.tsx           # 📋 Lista de fornecedores
│   │
│   └── 📁 VisualizacaoFornecedor/
│       └── VisualizacaoFornecedorPage.tsx # 👁️ Visualização detalhada
│
├── 📁 store/                               # 🗃️ Gerenciamento de Estado
│   └── fornecedores-store.ts              # ⚡ Store Zustand
│
├── 📁 types/                               # 🏷️ Definições TypeScript
│   ├── fornecedor.ts                       # 📄 Tipos consolidados
│   └── empresa.ts                          # 🏢 Tipos de empresa (legado)
│
├── 📁 hooks/                               # 🪝 Hooks Customizados
│   └── use-empresas.ts                    # 🔗 Hook principal
│
├── 📁 services/                            # 🔧 Serviços de API
│   └── empresa-service.ts                  # 🌐 Serviço de empresas
│
├── 📁 lib/                                 # 📚 Utilitários
│   └── query-keys.ts                      # 🔑 Chaves do React Query
│
├── 📖 README.md                            # 📚 Documentação principal
└── 📊 ESTRUTURA.md                         # 🗂️ Este arquivo
```

## 🔄 Fluxo de Dados

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mock Data     │    │  TypeScript      │    │   Componentes   │
│                 │    │   Interface      │    │                 │
│ fornecedores-   │───▶│  fornecedor.ts   │───▶│   React/UI      │
│     mock.ts     │    │      .ts         │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dados Mock    │    │   Tipagem        │    │   Interface     │
│   Consolidados  │    │   TypeScript     │    │   do Usuário    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Responsabilidades por Pasta

| Pasta         | Responsabilidade              | Arquivos Principais              |
| ------------- | ----------------------------- | -------------------------------- |
| `components/` | 🔧 Componentes reutilizáveis  | Formulários, tabelas, modais     |
| `data/`       | 💾 Dados mock e configurações | Mock consolidado, interfaces     |
| `pages/`      | 🌐 Páginas principais         | Listagem, visualização          |
| `store/`      | 🗃️ Estado global              | Store Zustand                    |
| `types/`      | 🏷️ Definições TypeScript      | Interfaces e tipos               |
| `hooks/`      | 🪝 Hooks customizados         | Lógica de negócio               |
| `services/`   | 🔧 Serviços de API            | Integração com backend          |
| `lib/`        | 📚 Utilitários                | Configurações e helpers         |

## 📁 Organização dos Componentes

```
components/
├── 📁 ListaFornecedores/     # 📋 Gerenciamento de Lista
│   ├── 🔍 filtros-fornecedores    # Filtros avançados
│   ├── 📤 modal-exportacao        # Confirmação de export
│   ├── ➕ modal-novo-fornecedor   # Cadastro de fornecedor
│   ├── 🔎 search-and-filters     # Busca básica
│   └── 📊 tabela-fornecedores     # Exibição em tabela
│
└── 📁 VisualizacaoFornecedor/   # 👁️ Visualização Detalhada
    ├── 📞 contatos-fornecedor    # Informações de contato
    ├── 🏠 endereco-fornecedor    # Dados de endereço
    ├── 📋 fornecedor-header      # Cabeçalho da página
    ├── 📄 FornecedorContratos    # Lista de contratos
    ├── 📈 FornecedorMetricas    # Métricas e indicadores
    ├── 🗂️ FornecedorTabs         # Sistema de abas
    ├── 👀 FornecedorVisaoGeral   # Visão geral
    └── ℹ️ informacoes-fornecedor  # Informações básicas
```

## 🚀 Benefícios da Estrutura

### ✅ **Organização Clara**

- Separação lógica por funcionalidade
- Fácil navegação e manutenção
- Componentes agrupados por contexto

### ✅ **Manutenibilidade**

- Dados centralizados em mock
- Tipos TypeScript bem definidos
- Componentes modulares e reutilizáveis

### ✅ **Escalabilidade**

- Estrutura preparada para crescimento
- Fácil adição de novos componentes
- Padrões consistentes

### ✅ **Migração para API**

- Formato mock facilita integração
- Separação clara entre dados e UI
- Interfaces bem definidas

## 🔍 Como Navegar

### Para **Desenvolvedores**:

1. **Novo componente**: `components/[Funcionalidade]/`
2. **Dados**: `data/fornecedores-mock.ts`
3. **Tipos**: `types/fornecedor.ts`
4. **Páginas**: `pages/[Funcionalidade]/`

### Para **Manutenção**:

1. **Dados mock**: Editar `data/fornecedores-mock.ts`
2. **Tipos**: Atualizar `types/fornecedor.ts`
3. **Componentes**: Modificar em `components/[Funcionalidade]/`

### Para **Testes**:

1. **Testes**: `components/[Funcionalidade]/__tests__/`
2. **Executar**: `pnpm test src/modules/Fornecedores`

## 🔗 Integração com API

### Fluxo de Dados da API

```
API Endpoints
    ↓
Services (empresa-service.ts)
    ↓
Hooks (use-empresas.ts)
    ↓
Components
    ↓
Store (fornecedores-store.ts)
    ↓
UI
```

### Principais Endpoints

- **GET** `/api/empresas` - Lista de empresas
- **GET** `/api/empresas/{id}` - Detalhes da empresa
- **POST** `/api/empresas` - Criar empresa
- **PUT** `/api/empresas/{id}` - Atualizar empresa
- **GET** `/api/empresas/resumo-contratos` - Resumo de contratos

## 📊 Estado Global (Zustand)

### Store Principal

```typescript
interface FornecedoresState {
  fornecedores: Fornecedor[]
  fornecedoresFiltrados: Fornecedor[]
  termoPesquisa: string
  filtros: FiltrosFornecedor
  paginacao: PaginacaoParamsFornecedor
  fornecedoresSelecionados: string[]
  // ... actions
}
```

### Principais Actions

- `setTermoPesquisa` - Define termo de busca
- `setFiltros` - Aplica filtros avançados
- `limparFiltros` - Remove todos os filtros
- `selecionarFornecedor` - Seleciona/deseleciona fornecedor
- `filtrarFornecedores` - Executa filtros

## 🧪 Estrutura de Testes

### Organização dos Testes

```
components/
├── ListaFornecedores/
│   ├── __tests__/
│   │   ├── filtros-fornecedores.test.tsx
│   │   ├── modal-confirmacao-exportacao.test.tsx
│   │   ├── search-and-filters.test.tsx
│   │   └── tabela-fornecedores.test.tsx
│   └── [componentes].tsx
└── VisualizacaoFornecedor/
    ├── __tests__/
    │   └── FornecedorContratos.test.tsx
    └── [componentes].tsx
```

### Executar Testes

```bash
# Todos os testes do módulo
pnpm test src/modules/Fornecedores

# Teste específico
pnpm test src/modules/Fornecedores/components/ListaFornecedores/__tests__/tabela-fornecedores.test.tsx
```

---

_📚 Esta documentação deve ser atualizada sempre que houver mudanças na estrutura do módulo._
