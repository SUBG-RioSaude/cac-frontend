# 📊 Diagrama Visual da Estrutura - Módulo Contratos

## 🗂️ Estrutura de Pastas

```
src/modules/Contratos/
│
├── 📁 components/                           # 🔧 Componentes Reutilizáveis
│   ├── 📁 CadastroDeContratos/             # ✍️ Formulários de Cadastro
│   │   ├── confirmar-avanco.tsx           # ✅ Confirmação de etapas
│   │   ├── contrato-form.tsx              # 📋 Formulário principal
│   │   ├── fornecedor-form.tsx            # 🏢 Cadastro de fornecedor
│   │   └── unidades-form.tsx              # 🏛️ Configuração de unidades
│   │
│   ├── 📁 ListaContratos/                  # 📋 Listagem e Filtros
│   │   ├── filtros-contratos.tsx          # 🔍 Filtros avançados
│   │   ├── modal-confirmacao-exportacao.tsx # 📤 Confirmação de export
│   │   ├── pesquisa-e-filtros.tsx         # 🔎 Pesquisa básica
│   │   └── tabela-contratos.tsx           # 📊 Tabela responsiva
│   │
│   └── 📁 VisualizacaoContratos/          # 👁️ Visualização Detalhada
│       ├── detalhes-contrato.tsx          # 📄 Aba de detalhes
│       ├── indicadores-relatorios.tsx     # 📈 Aba de indicadores
│       └── registro-alteracoes.tsx        # 📝 Aba de histórico
│
├── 📁 data/                                # 💾 Dados e Configurações
│   ├── contratos-data.json                # 🗃️ DADOS PRINCIPAIS (JSON)
│   ├── contratos-mock.ts                  # 🔗 Interface TypeScript
│   └── contratos-data.d.ts                # 🏷️ Declarações de tipos
│
├── 📁 pages/                               # 🌐 Páginas Principais
│   ├── 📁 CadastroContratos/
│   │   └── cadastrar-contrato.tsx         # ➕ Página de cadastro
│   │
│   └── 📁 VisualizacaoContratos/
│       ├── ContratosListPage.tsx          # 📋 Lista de contratos
│       └── VisualizarContrato.tsx         # 👁️ Visualização detalhada
│
├── 📁 store/                               # 🗃️ Gerenciamento de Estado
│   └── contratos-store.ts                  # ⚡ Store Zustand
│
├── 📁 types/                               # 🏷️ Definições TypeScript
│   ├── contrato.ts                         # 📄 Tipo básico de contrato
│   └── contrato-detalhado.ts              # 📋 Tipo completo de contrato
│
├── 📁 contratos/                           # 🚧 PÁGINAS LEGADAS
│   └── cadastrar-contrato.tsx             # ⚠️ Versão antiga (migrar)
│
├── 📖 README.md                            # 📚 Documentação principal
└── 📊 ESTRUTURA.md                         # 🗂️ Este arquivo
```

## 🔄 Fluxo de Dados

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   JSON Data     │    │  TypeScript      │    │   Componentes   │
│                 │    │   Interface      │    │                 │
│ contratos-data  │───▶│  contratos-mock  │───▶│   React/UI      │
│     .json       │    │      .ts         │    │                 │
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
| `data/`       | 💾 Dados mock e configurações | JSON consolidado, interfaces     |
| `pages/`      | 🌐 Páginas principais         | Cadastro, listagem, visualização |
| `store/`      | 🗃️ Estado global              | Store Zustand                    |
| `types/`      | 🏷️ Definições TypeScript      | Interfaces e tipos               |
| `contratos/`  | 🚧 Páginas legadas            | Arquivos para migração           |

## 📁 Organização dos Componentes

```
components/
├── 📁 CadastroDeContratos/     # ✍️ Fluxo de Cadastro
│   ├── 1️⃣ confirmar-avanco     # Confirmação de etapas
│   ├── 2️⃣ contrato-form        # Formulário principal
│   ├── 3️⃣ fornecedor-form      # Dados do fornecedor
│   └── 4️⃣ unidades-form        # Configuração de unidades
│
├── 📁 ListaContratos/          # 📋 Gerenciamento de Lista
│   ├── 🔍 filtros-contratos    # Filtros avançados
│   ├── 📤 modal-exportacao     # Confirmação de export
│   ├── 🔎 pesquisa-filtros     # Busca básica
│   └── 📊 tabela-contratos     # Exibição em tabela
│
└── 📁 VisualizacaoContratos/   # 👁️ Visualização Detalhada
    ├── 📄 detalhes-contrato    # Informações gerais
    ├── 📈 indicadores          # Métricas e relatórios
    └── 📝 alteracoes           # Histórico de mudanças
```

## 🚀 Benefícios da Estrutura

### ✅ **Organização Clara**

- Separação lógica por funcionalidade
- Fácil navegação e manutenção
- Componentes agrupados por contexto

### ✅ **Manutenibilidade**

- Dados centralizados em JSON
- Tipos TypeScript bem definidos
- Componentes modulares e reutilizáveis

### ✅ **Escalabilidade**

- Estrutura preparada para crescimento
- Fácil adição de novos componentes
- Padrões consistentes

### ✅ **Migração para API**

- Formato JSON facilita integração
- Separação clara entre dados e UI
- Interfaces bem definidas

## 🔍 Como Navegar

### Para **Desenvolvedores**:

1. **Novo componente**: `components/[Funcionalidade]/`
2. **Dados**: `data/contratos-data.json`
3. **Tipos**: `types/[nome].ts`
4. **Páginas**: `pages/[Funcionalidade]/`

### Para **Manutenção**:

1. **Dados mock**: Editar `data/contratos-data.json`
2. **Tipos**: Atualizar `types/[nome].ts`
3. **Componentes**: Modificar em `components/[Funcionalidade]/`

### Para **Testes**:

1. **Testes**: `components/[Funcionalidade]/__tests__/`
2. **Executar**: `pnpm test src/modules/Contratos`

---

_📚 Esta documentação deve ser atualizada sempre que houver mudanças na estrutura do módulo._
