# Módulo Unidades - Documentação da Estrutura

## 📁 Visão Geral da Estrutura

```
src/modules/Unidades/
├── 📁 ListaUnidades/                 # Sub-módulo para listagem
│   ├── 📁 components/                # Componentes de listagem
│   │   └── 📁 skeletons/             # Componentes de loading
│   ├── 📁 data/                      # Dados mock
│   ├── 📁 pages/                     # Páginas de listagem
│   ├── 📁 store/                     # Estado local
│   └── 📁 types/                     # Tipos específicos
├── 📁 UnidadeDetalhes/               # Sub-módulo para detalhes
│   ├── 📁 components/                # Componentes de detalhes
│   ├── 📁 data/                      # Dados mock
│   ├── 📁 pages/                     # Páginas de detalhes
│   ├── 📁 store/                     # Estado local
│   └── 📁 types/                     # Tipos específicos
├── 📁 VisualizacaoUnidade/           # Sub-módulo para visualização
│   ├── 📁 components/                # Componentes de visualização
│   ├── 📁 hooks/                     # Hooks customizados
│   └── 📁 pages/                     # Páginas de visualização
├── 📁 hooks/                         # Hooks globais do módulo
├── 📁 pages/                         # Páginas principais
├── 📁 services/                      # Serviços de API
└── 📁 types/                         # Tipos globais do módulo
```

## 🔧 Componentes

### 📁 ListaUnidades/components/

Componentes para listagem e busca de unidades.

- **`search-and-filters-unidades.tsx`** - Barra de pesquisa e filtros
- **`tabela-unidades.tsx`** - Tabela responsiva de unidades

#### 📁 skeletons/

- **`unidades-page-skeleton.tsx`** - Loading skeleton para a página

### 📁 UnidadeDetalhes/components/

Componentes para detalhamento de unidades.

- **`lista-contratos.tsx`** - Lista de contratos vinculados

### 📁 VisualizacaoUnidade/components/

Componentes para visualização detalhada.

- **`visualizacao-unidade.tsx`** - Componente principal de visualização
- **`visao-geral-unidade.tsx`** - Visão geral da unidade
- **`endereco-unidade.tsx`** - Informações de endereço

## 📄 Páginas

### 📁 ListaUnidades/pages/

- **`unidades-list-page.tsx`** - Lista principal de unidades

### 📁 UnidadeDetalhes/pages/

- **`unidade-detalhes-page.tsx`** - Página de detalhes

### 📁 VisualizacaoUnidade/pages/

- **`unidade-detalhes-page.tsx`** - Visualização detalhada

### 📁 pages/

- **`unidade-detalhes-page.tsx`** - Página principal de detalhes

## 🔌 Hooks

### 📁 hooks/

- **`use-unidade-detalhada.ts`** - Hook para buscar dados detalhados
- **`use-unidades-gestoras.ts`** - Hook para buscar unidades gestoras

### 📁 VisualizacaoUnidade/hooks/

- **`use-unidade-details.ts`** - Hook para detalhes da unidade

## 🌐 Serviços

### 📁 services/

- **`unidades-service.ts`** - Serviços de API para unidades
- **`query-keys.ts`** - Keys do TanStack Query

## 🏷️ Tipos

### 📁 types/

- **`unidade.ts`** - Interface para unidade
- **`unidade-detalhada.ts`** - Interface para unidade detalhada

## 🧪 Testes

Estrutura de testes bem definida:

```
components/
├── __tests__/
│   ├── search-and-filters-unidades.test.tsx
│   ├── tabela-unidades.test.tsx
│   ├── lista-contratos.test.tsx
│   └── unidades-page-skeleton.test.tsx
pages/
├── __tests__/
│   ├── unidades-list-page.test.tsx
│   └── unidade-detalhes-page.test.tsx
```

## 📚 Como Usar

### 1. Importação de Componentes

```typescript
import { TabelaUnidades } from '@/modules/Unidades/ListaUnidades/components/tabela-unidades'
import { VisaoGeralUnidade } from '@/modules/Unidades/VisualizacaoUnidade/components/visao-geral-unidade'
```

### 2. Hooks Disponíveis

```typescript
import { useUnidadeDetalhada } from '@/modules/Unidades/hooks/use-unidade-detalhada'
import { useUnidadesGestoras } from '@/modules/Unidades/hooks/use-unidades-gestoras'
```

### 3. Serviços de API

```typescript
import { obterUnidades, obterUnidadePorId } from '@/modules/Unidades/services/unidades-service'
```

### 4. Rotas

```typescript
// Lista de unidades
/unidades

// Visualização de unidade específica
/unidades/:unidadeId
```

## 🔄 Fluxo de Dados

```
API (useUnidadeDetalhada, useUnidadesGestoras)
    ↓
Services (unidades-service.ts)
    ↓
Componentes (components/)
    ↓
Páginas (pages/)
    ↓
Interface do Usuário
```

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case (ex: `tabela-unidades.tsx`)
- **Componentes**: PascalCase (ex: `TabelaUnidades`)
- **Funções**: camelCase (ex: `handleVisualizarUnidade`)
- **Tipos**: PascalCase (ex: `UnidadeDetalhada`)
- **Hooks**: camelCase com prefixo `use` (ex: `useUnidadeDetalhada`)

## 🎯 Funcionalidades Principais

1. **Listagem de Unidades**
   - Busca e filtros
   - Tabela com informações principais
   - Loading states com skeletons

2. **Visualização Detalhada**
   - Informações cadastrais completas
   - Dados de endereço e localização
   - Códigos administrativos (UA, UO, UG, CNES)
   - Informações do CAP (Centro de Aplicação)

3. **Integração com Contratos**
   - Lista de contratos vinculados à unidade
   - Navegação para detalhes do contrato

## 🏗️ Estrutura de Dados

### Unidade Básica

```typescript
interface Unidade {
  id: string
  nome: string
  sigla: string
  ativo: boolean
}
```

### Unidade Detalhada

```typescript
interface UnidadeDetalhada {
  id: string
  nome: string
  sigla: string
  ativo: boolean
  endereco: string
  bairro: string
  latitude: string
  longitude: string
  ua: string
  uo: string
  ug: string
  cnes: string
  subsecretaria: string
  ap: string
  cap: {
    nome: string
    uo: string
  }
}
```

## 📞 Suporte

Para dúvidas sobre a estrutura ou necessidade de modificações:

1. Verifique esta documentação
2. Consulte os hooks disponíveis para integração com a API
3. Analise os testes para entender o comportamento esperado
4. Mantenha consistência com as convenções estabelecidas
