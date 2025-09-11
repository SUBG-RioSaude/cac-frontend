# Módulo Fornecedores - Documentação da Estrutura

## 📁 Visão Geral da Estrutura

```
src/modules/Fornecedores/
├── 📁 components/                    # Componentes reutilizáveis
│   ├── 📁 ListaFornecedores/         # Componentes para listagem
│   └── 📁 VisualizacaoFornecedor/    # Componentes para visualização
├── 📁 data/                          # Dados mock e configurações
├── 📁 pages/                         # Páginas principais do módulo
│   ├── 📁 ListaFornecedores/         # Página de listagem
│   └── 📁 VisualizacaoFornecedor/    # Página de visualização
├── 📁 store/                         # Gerenciamento de estado (Zustand)
├── 📁 types/                         # Definições de tipos TypeScript
├── 📁 hooks/                         # Hooks customizados
├── 📁 services/                      # Serviços de API
└── 📁 lib/                          # Utilitários e configurações
```

## 🔧 Componentes (`components/`)

### 📁 ListaFornecedores/

Componentes responsáveis pela listagem e gerenciamento de fornecedores.

- **`filtros-fornecedores.tsx`** - Filtros avançados para busca de fornecedores
- **`modal-confirmacao-exportacao.tsx`** - Modal de confirmação para exportação
- **`modal-novo-fornecedor.tsx`** - Modal para cadastro de novo fornecedor
- **`search-and-filters.tsx`** - Barra de pesquisa e filtros básicos
- **`tabela-fornecedores.tsx`** - Tabela responsiva de fornecedores

### 📁 VisualizacaoFornecedor/

Componentes para visualização detalhada de fornecedores.

- **`contatos-fornecedor.tsx`** - Componente de contatos do fornecedor
- **`endereco-fornecedor.tsx`** - Componente de endereço do fornecedor
- **`fornecedor-header.tsx`** - Cabeçalho da página de visualização
- **`FornecedorContratos.tsx`** - Lista de contratos do fornecedor
- **`FornecedorMetricas.tsx`** - Métricas e indicadores do fornecedor
- **`FornecedorTabs.tsx`** - Sistema de abas da visualização
- **`FornecedorVisaoGeral.tsx`** - Visão geral do fornecedor
- **`informacoes-fornecedor.tsx`** - Informações básicas do fornecedor

## 📊 Dados (`data/`)

### Arquivos de Dados

- **`fornecedores-mock.ts`** - Dados mock consolidados para fornecedores

### Estrutura dos Dados

```typescript
// Dados mock organizados por funcionalidade
export const fornecedoresMock: Fornecedor[] = [...]
```

## 📄 Páginas (`pages/`)

### 📁 ListaFornecedores/

- **`FornecedoresPage.tsx`** - Página principal de listagem de fornecedores

### 📁 VisualizacaoFornecedor/

- **`VisualizacaoFornecedorPage.tsx`** - Página de visualização detalhada de fornecedor

## 🗃️ Estado (`store/`)

### Gerenciamento de Estado

- **`fornecedores-store.ts`** - Store Zustand para estado global dos fornecedores

## 🏷️ Tipos (`types/`)

### Definições TypeScript

- **`fornecedor.ts`** - Interfaces consolidadas para fornecedores e empresas
- **`empresa.ts`** - Tipos específicos para empresas (mantido para compatibilidade)

## 🪝 Hooks (`hooks/`)

### Hooks Customizados

- **`use-empresas.ts`** - Hook para gerenciamento de empresas e fornecedores

## 🔧 Serviços (`services/`)

### Serviços de API

- **`empresa-service.ts`** - Serviço para operações com empresas via API

## 📚 Utilitários (`lib/`)

### Configurações e Utilitários

- **`query-keys.ts`** - Chaves para React Query/TanStack Query

## 🧪 Testes

### Estrutura de Testes

Cada componente possui sua pasta de testes:

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

## 📚 Como Usar

### 1. Importação de Dados

```typescript
import { fornecedoresMock } from '@/modules/Fornecedores/data/fornecedores-mock'
```

### 2. Tipos Disponíveis

```typescript
import type { 
  Fornecedor, 
  EmpresaResponse, 
  FiltrosFornecedor 
} from '@/modules/Fornecedores/types/fornecedor'
```

### 3. Estado Global

```typescript
import { useFornecedoresStore } from '@/modules/Fornecedores/store/fornecedores-store'
```

### 4. Hooks Customizados

```typescript
import { useEmpresas } from '@/modules/Fornecedores/hooks/use-empresas'
```

## 🔄 Fluxo de Dados

```
Mock Data (fornecedores-mock.ts)
    ↓
TypeScript Types (types/fornecedor.ts)
    ↓
Components (components/)
    ↓
Pages (pages/)
    ↓
Interface do Usuário
```

## 🚀 Benefícios da Nova Estrutura

1. **Organização Clara**: Separação lógica por funcionalidade
2. **Manutenibilidade**: Fácil navegação e atualização de componentes
3. **Escalabilidade**: Estrutura preparada para crescimento
4. **Consistência**: Padrão alinhado com o módulo Contratos
5. **Tipagem**: TypeScript garante consistência dos dados

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case (ex: `filtros-fornecedores.tsx`)
- **Componentes**: PascalCase (ex: `FornecedorContratos`)
- **Funções**: camelCase (ex: `handleSubmit`)
- **Tipos**: PascalCase (ex: `FornecedorResumoApi`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)

## 🔍 Busca e Filtros

Para encontrar arquivos específicos:

- **Componentes**: `src/modules/Fornecedores/components/**/*.tsx`
- **Páginas**: `src/modules/Fornecedores/pages/**/*.tsx`
- **Tipos**: `src/modules/Fornecedores/types/*.ts`
- **Dados**: `src/modules/Fornecedores/data/*`

## 📞 Suporte

Para dúvidas sobre a estrutura ou necessidade de modificações:

1. Verifique primeiro esta documentação
2. Consulte os tipos TypeScript para entender a estrutura dos dados
3. Analise os componentes existentes como referência
4. Mantenha a consistência com as convenções estabelecidas

---

_📚 Esta documentação deve ser atualizada sempre que houver mudanças na estrutura do módulo._
