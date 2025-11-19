# Módulo Fornecedores - Documentação da Estrutura

## 📁 Visão Geral da Estrutura

```
src/modules/Fornecedores/
├── 📁 ListaFornecedores/             # Sub-módulo para listagem
│   ├── 📁 components/                # Componentes de listagem
│   ├── 📁 data/                      # Dados mock
│   ├── 📁 pages/                     # Páginas de listagem
│   ├── 📁 store/                     # Estado local
│   └── 📁 types/                     # Tipos específicos
└── 📁 VisualizacaoFornecedor/        # Sub-módulo para visualização
    ├── 📁 components/                # Componentes de visualização
    └── 📁 pages/                     # Páginas de visualização
```

## 🔧 Componentes

### 📁 ListaFornecedores/components/

Componentes para listagem e busca de fornecedores.

- **`filtros-fornecedores.tsx`** - Filtros avançados para busca
- **`modal-confirmacao-exportacao.tsx`** - Confirmação de exportação
- **`modal-novo-fornecedor.tsx`** - Modal para cadastro rápido
- **`search-and-filters.tsx`** - Barra de pesquisa e filtros
- **`tabela-fornecedores.tsx`** - Tabela responsiva de fornecedores

### 📁 VisualizacaoFornecedor/components/

Componentes para visualização detalhada de fornecedores.

- **`fornecedor-header.tsx`** - Cabeçalho com informações principais
- **`fornecedor-tabs.tsx`** - Sistema de navegação por abas
- **`fornecedor-visao-geral.tsx`** - Visão geral e métricas
- **`fornecedor-contratos.tsx`** - Lista de contratos vinculados
- **`fornecedor-metricas.tsx`** - Métricas e KPIs
- **`informacoes-fornecedor.tsx`** - Dados cadastrais
- **`endereco-fornecedor.tsx`** - Informações de endereço
- **`contatos-fornecedor.tsx`** - Informações de contato

## 📄 Páginas

### 📁 ListaFornecedores/pages/

- **`fornecedores-page.tsx`** - Lista principal de fornecedores

### 📁 VisualizacaoFornecedor/pages/

- **`visualizacao-fornecedor-page.tsx`** - Visualização detalhada

## 🗃️ Estado

### 📁 ListaFornecedores/store/

- **`fornecedores-store.ts`** - Store Zustand para lista de fornecedores

## 🏷️ Tipos

### 📁 ListaFornecedores/types/

- **`fornecedor.ts`** - Interface para fornecedor

## 🧪 Testes

Estrutura de testes bem definida:

```
components/
├── __tests__/
│   ├── filtros-fornecedores.test.tsx
│   ├── search-and-filters.test.tsx
│   ├── modal-confirmacao-exportacao.test.tsx
│   ├── tabela-fornecedores.test.tsx
│   └── fornecedor-contratos.test.tsx
```

## 📚 Como Usar

### 1. Importação de Componentes

```typescript
import { TabelaFornecedores } from '@/modules/Fornecedores/ListaFornecedores/components/tabela-fornecedores'
import { FornecedorVisaoGeral } from '@/modules/Fornecedores/VisualizacaoFornecedor/components/fornecedor-visao-geral'
```

### 2. Rotas

```typescript
// Lista de fornecedores
/fornecedores

// Visualização de fornecedor específico
/fornecedores/:fornecedorId
```

## 🔄 Fluxo de Dados

```
API (useConsultarEmpresaPorCNPJ)
    ↓
Componentes (components/)
    ↓
Páginas (pages/)
    ↓
Interface do Usuário
```

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case (ex: `fornecedor-header.tsx`)
- **Componentes**: PascalCase (ex: `FornecedorHeader`)
- **Funções**: camelCase (ex: `handleVisualizarFornecedor`)
- **Tipos**: PascalCase (ex: `Fornecedor`)

## 🎯 Funcionalidades Principais

1. **Listagem de Fornecedores**
   - Busca e filtros avançados
   - Exportação de dados
   - Paginação

2. **Visualização Detalhada**
   - Informações cadastrais completas
   - Lista de contratos vinculados
   - Métricas e KPIs
   - Informações de contato

3. **Integração com Contratos**
   - Visualização de contratos por fornecedor
   - Filtros e ordenação de contratos
   - Navegação para detalhes do contrato

## 📞 Suporte

Para dúvidas sobre a estrutura ou necessidade de modificações:

1. Verifique esta documentação
2. Consulte os testes para entender o comportamento esperado
3. Mantenha consistência com as convenções estabelecidas
