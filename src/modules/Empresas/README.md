# Módulo Empresas - Documentação da Estrutura

## 📁 Visão Geral da Estrutura

```
src/modules/Empresas/
├── 📁 hooks/                         # Hooks customizados
├── 📁 lib/                           # Utilitários e configurações
├── 📁 services/                      # Serviços de API
└── 📁 types/                         # Definições de tipos
```

## 🔌 Hooks

### 📁 hooks/

- **`use-empresas.ts`** - Hook para gerenciamento de empresas

Hooks disponíveis:
- `useConsultarEmpresaPorCNPJ` - Buscar empresa por CNPJ
- `useConsultarEmpresas` - Listar empresas

## 🌐 Serviços

### 📁 services/

- **`empresa-service.ts`** - Serviços de API para empresas
- **`query-keys.ts`** - Keys do TanStack Query

Serviços disponíveis:
- `consultarEmpresaPorCNPJ()` - Buscar empresa específica
- `consultarEmpresas()` - Listar todas as empresas

## 🏷️ Tipos

### 📁 types/

- **`empresa.ts`** - Interface para empresa

### Tipos Principais

```typescript
interface EmpresaResponse {
  id: string
  razaoSocial: string
  cnpj: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  ativo: boolean
  contatos: Contato[]
}

interface Contato {
  id: string
  nome: string
  email: string
  telefone: string
}
```

## 📚 Como Usar

### 1. Hooks de Consulta

```typescript
import { useConsultarEmpresaPorCNPJ, useConsultarEmpresas } from '@/modules/Empresas/hooks/use-empresas'

// Buscar empresa por CNPJ
const { data: empresa, isLoading } = useConsultarEmpresaPorCNPJ('12345678000190')

// Listar empresas
const { data: empresas } = useConsultarEmpresas({ pagina: 1, itensPorPagina: 10 })
```

### 2. Serviços Diretos

```typescript
import { consultarEmpresaPorCNPJ, consultarEmpresas } from '@/modules/Empresas/services/empresa-service'

// Uso direto dos serviços (sem cache do TanStack Query)
const empresa = await consultarEmpresaPorCNPJ('12345678000190')
const empresas = await consultarEmpresas({ pagina: 1, itensPorPagina: 10 })
```

### 3. Tipos

```typescript
import type { EmpresaResponse, Contato } from '@/modules/Empresas/types/empresa'
```

## 🔄 Fluxo de Dados

```
API
    ↓
Services (empresa-service.ts)
    ↓
Hooks (use-empresas.ts)
    ↓
TanStack Query (cache)
    ↓
Componentes consumidores
```

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case (ex: `empresa-service.ts`)
- **Funções**: camelCase (ex: `consultarEmpresaPorCNPJ`)
- **Tipos**: PascalCase (ex: `EmpresaResponse`)
- **Hooks**: camelCase com prefixo `use` (ex: `useConsultarEmpresas`)

## 🎯 Uso no Projeto

O módulo Empresas é consumido por:

1. **Módulo Fornecedores**
   - Visualização de dados da empresa fornecedora
   - Listagem de fornecedores

2. **Módulo Contratos**
   - Vínculo de empresa contratada
   - Busca por CNPJ no cadastro

## 🔍 Query Keys

Keys do TanStack Query definidas em `query-keys.ts`:

```typescript
export const empresaKeys = {
  all: ['empresas'] as const,
  lists: () => [...empresaKeys.all, 'list'] as const,
  list: (params: PaginacaoParams) => [...empresaKeys.lists(), params] as const,
  details: () => [...empresaKeys.all, 'detail'] as const,
  detail: (cnpj: string) => [...empresaKeys.details(), cnpj] as const,
}
```

## 🧪 Testes

**Status**: Estrutura criada, aguardando implementação de testes.

Testes planejados:
```
hooks/
├── __tests__/
│   └── use-empresas.test.ts
services/
├── __tests__/
│   └── empresa-service.test.ts
```

## 🚧 Status de Desenvolvimento

| Funcionalidade | Status |
|---|---|
| Hooks de consulta | ✅ Implementado |
| Serviços de API | ✅ Implementado |
| Tipos TypeScript | ✅ Implementado |
| Query Keys | ✅ Implementado |
| Testes | ⏳ Pendente |
| Componentes UI | ⏳ Pendente |
| Páginas | ⏳ Pendente |

## 📋 Próximos Passos

1. **Estruturação de sub-módulos** (se necessário)
   - Criar `ListaEmpresas/`
   - Criar `VisualizacaoEmpresa/`

2. **Implementação de componentes** (se necessário)
   - Tabela de empresas
   - Formulários de cadastro
   - Cards de visualização

3. **Expansão de testes**
   - Testes para hooks
   - Testes para serviços
   - Testes de integração

## 💡 Observações

- Este módulo serve principalmente como **serviço compartilhado** para outros módulos
- Empresas são atualmente gerenciadas através do módulo **Fornecedores**
- A estrutura mínima atual é suficiente para as necessidades do projeto
- Expansão futura pode incluir interface dedicada se necessário

## 📞 Suporte

Para dúvidas sobre a estrutura ou necessidade de modificações:

1. Consulte esta documentação
2. Verifique o uso em Fornecedores e Contratos como referência
3. Mantenha consistência com os serviços existentes
4. Use TanStack Query para cache automático de dados
