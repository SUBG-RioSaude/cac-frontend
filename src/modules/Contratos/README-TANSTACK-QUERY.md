# TanStack React Query - Integração Completa

Este documento descreve a implementação completa do TanStack React Query no módulo de contratos.

## 🚀 O que foi implementado

### 1. Configuração Base

- **QueryClient otimizado** (`src/main.tsx`):
  - Cache de 5 minutos (staleTime)
  - Garbage collection de 10 minutos
  - Retry inteligente (não retry em erros 4xx)
  - Background refetch configurado
  - DevTools habilitado para desenvolvimento

### 2. Arquitetura Service + Hooks

**Mantemos o service existente** (`src/modules/Contratos/services/contratos-service.ts`) e criamos **hooks que consomem o service**:

```
contratos-service.ts  (inalterado - funções puras)
    ↓
use-contratos.ts     (hooks React Query que usam o service)
    ↓
Componentes         (consomem os hooks)
```

### 3. Hooks Implementados

#### Queries (Busca de dados)

- `useContratos(filtros, options)` - Lista paginada com filtros
- `useContrato(id, options)` - Busca por ID específico
- `useContratosVencendo(dias, options)` - Contratos vencendo
- `useContratosVencidos(options)` - Contratos vencidos

#### Mutations (Modificação de dados)

- `useCriarContrato()` - Criar novo contrato
- `useUpdateContrato()` - Atualizar contrato existente
- `useDeleteContrato()` - Deletar contrato (soft delete)
- `useSuspendContrato()` - Suspender contrato
- `useReactivateContrato()` - Reativar contrato suspenso
- `useEncerrarContrato()` - Encerrar contrato

### 4. Query Keys Factory

Sistema hierárquico de chaves para cache consistente (`src/modules/Contratos/lib/query-keys.ts`):

```typescript
contratoKeys = {
  all: ['contratos'],
  lists: () => [...contratoKeys.all, 'list'],
  list: (filtros) => [...contratoKeys.lists(), filtros],
  detail: (id) => [...contratoKeys.details(), id],
  // ... outras chaves específicas
}
```

### 5. Error Handling Integrado

- **useErrorHandler**: Redireciona para páginas HTTP (400, 401, 403, 404, 500, 503)
- **useToast melhorado**:
  - Toasts específicos para mutations (`mutation.success`, `mutation.error`)
  - Toasts para queries (`query.error`)
  - Integração automática com error handling

### 6. Features Avançadas

#### Optimistic Updates

Mutations fazem atualizações otimistas com rollback automático em caso de erro:

```typescript
onMutate: async (data) => {
  // Cancelar queries conflitantes
  await queryClient.cancelQueries({ queryKey: contratoKeys.detail(id) })

  // Snapshot para rollback
  const previousData = queryClient.getQueryData(contratoKeys.detail(id))

  // Update otimístico
  queryClient.setQueryData(contratoKeys.detail(id), newData)

  return { previousData }
}
```

#### Cache Invalidation Inteligente

Cada mutation invalida automaticamente as queries relacionadas:

```typescript
onSuccess: (data, variables) => {
  // Invalidar todas as queries relacionadas
  const keysToInvalidate = contratoKeys.invalidateOnUpdate(data.id)
  keysToInvalidate.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key })
  })
}
```

#### Loading States Automáticos

Todos os hooks retornam estados de loading, error e data:

```typescript
const { data, isLoading, error, isFetching, refetch } = useContratos(filtros)
const { mutate, isPending, isError } = useCriarContrato()
```

## 📁 Estrutura de Arquivos

```
src/modules/Contratos/
├── services/
│   └── contratos-service.ts          # Service original (inalterado)
├── hooks/
│   ├── use-contratos.ts             # Hooks de queries
│   ├── use-contratos-mutations.ts   # Hooks de mutations
│   ├── useToast.ts                  # Toast melhorado
│   └── index.ts                     # Exports centralizados
├── lib/
│   └── query-keys.ts                # Factory de query keys
└── examples/
    └── hooks-usage.tsx              # Exemplos práticos de uso
```

## 🎯 Como Usar

### Exemplo 1: Lista de Contratos

```typescript
function ContratosPage() {
  const [filtros, setFiltros] = useState({ pagina: 1, tamanhoPagina: 20 })

  const { data, isLoading, error, refetch } = useContratos(filtros, {
    keepPreviousData: true  // Mantém dados durante paginação
  })

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar</div>

  return (
    <div>
      {data?.dados.map(contrato => (
        <div key={contrato.id}>{contrato.numeroContrato}</div>
      ))}
    </div>
  )
}
```

### Exemplo 2: Criar Contrato

```typescript
function CreateContratoForm() {
  const createMutation = useCriarContrato()

  const handleSubmit = (formData) => {
    // Toast, loading, error handling e redirecionamento são automáticos
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do formulário */}
      <button disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Criando...' : 'Criar'}
      </button>
    </form>
  )
}
```

### Exemplo 3: Controle Avançado

```typescript
function ContratoDetail({ id }) {
  const { data: contrato } = useContrato(id)
  const updateMutation = useUpdateContrato()

  const handleUpdate = (changes) => {
    updateMutation.mutate({
      id,
      ...changes  // Apenas campos modificados
    })
    // Optimistic update + rollback automático
  }

  return (
    <div>
      <h1>{contrato?.numeroContrato}</h1>
      <button onClick={() => handleUpdate({ status: 'suspenso' })}>
        Suspender
      </button>
    </div>
  )
}
```

## ✅ Vantagens da Implementação

1. **Cache Inteligente**: Dados ficam em cache, reduzindo calls desnecessárias
2. **Loading States**: Estados de loading/error automáticos
3. **Optimistic Updates**: Interface responsiva com rollback automático
4. **Error Handling**: Redirecionamento automático para páginas de erro
5. **Background Refetch**: Dados sempre atualizados em background
6. **DevTools**: Debugging visual do estado das queries
7. **TypeScript**: Type safety completa end-to-end
8. **Service Preservado**: Mantém arquitetura existente

## 🔧 Configurações

### Stale Time: 5 minutos

Dados são considerados "frescos" por 5 minutos

### Garbage Collection: 10 minutos

Dados não utilizados são removidos após 10 minutos

### Retry Policy

- **Queries**: 3 tentativas para erros de rede, 0 para erros 4xx
- **Mutations**: 1 tentativa

### Error Handling

- **Erros críticos (5xx, 401, 403)**: Redirecionamento automático
- **Outros erros**: Toast notification

## 📊 DevTools

Em desenvolvimento, acesse as DevTools do React Query para:

- Visualizar estado das queries
- Ver cache hits/misses
- Debug de invalidações
- Monitorar network requests

## 🚀 Próximos Passos

1. Migrar componentes existentes para usar os novos hooks
2. Adicionar prefetching para navegação mais rápida
3. Implementar cache offline com persistência
4. Configurar retry específico por operação
5. Adicionar métricas de performance
