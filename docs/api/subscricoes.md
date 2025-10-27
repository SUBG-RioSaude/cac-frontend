# Sistema de Subscrições (Seguir Entidades)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [API Client](#api-client)
4. [Hooks TanStack Query](#hooks-tanstack-query)
5. [Componentes UI](#componentes-ui)
6. [Tipos TypeScript](#tipos-typescript)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Testes](#testes)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Visão Geral

O **Sistema de Subscrições** permite que usuários **sigam** entidades específicas (contratos, fornecedores, unidades, etc.) para receber **notificações automáticas** sobre mudanças e atualizações.

### Funcionalidades

✅ **Toggle Seguir/Deixar de Seguir** - Um clique para alternar
✅ **Verificação de Status** - Sabe automaticamente se está seguindo
✅ **Optimistic Updates** - UI atualiza antes da API responder
✅ **Feedback Visual** - Toasts automáticos de sucesso/erro
✅ **Responsivo** - Adapta-se a mobile e desktop
✅ **Componentes Especializados** - Variantes pré-configuradas por domínio

---

## 🏗️ Arquitetura

```
┌────────────────────────────────────────────────────────────┐
│                    COMPONENTE UI                           │
│  BotaoSeguir / BotaoSeguirContrato / etc.                  │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                 HOOKS TANSTACK QUERY                       │
│  useVerificarSeguindoQuery()                              │
│  useToggleSeguirMutation()                                │
│  useMinhasSubscricoesQuery()                              │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                    API CLIENT                              │
│  toggleSeguir()                                           │
│  verificarSeguindo()                                      │
│  listarMinhasSubscricoes()                                │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│              egestao-micro-notificacao-api                 │
│  POST /api/subscricoes/seguir                             │
│  GET /api/subscricoes/estou-seguindo                      │
│  GET /api/subscricoes/minhas                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Client

**Localização:** `src/services/notificacao-api.ts`

### Endpoints Disponíveis

#### 1. `toggleSeguir(request)`

Toggle: seguir ou deixar de seguir uma entidade.

```typescript
import { toggleSeguir } from '@/services/notificacao-api'

const response = await toggleSeguir({
  sistemaId: 'contratos',
  entidadeOrigemId: 'contrato-123'
})

// Response
{
  seguindo: true,
  mensagem: 'Você está seguindo esta entidade',
  subscricaoId: 'sub-guid'
}
```

**Endpoint:** `POST /api/subscricoes/seguir`

#### 2. `verificarSeguindo(sistemaId, entidadeOrigemId)`

Verifica se está seguindo uma entidade.

```typescript
import { verificarSeguindo } from '@/services/notificacao-api'

const status = await verificarSeguindo('contratos', 'contrato-123')

// Response (seguindo)
{
  seguindo: true,
  subscricaoId: 'sub-123',
  criadoEm: '2025-01-23T10:00:00Z'
}

// Response (não seguindo)
{
  seguindo: false
}
```

**Endpoint:** `GET /api/subscricoes/estou-seguindo`

#### 3. `listarMinhasSubscricoes(page, pageSize, sistemaId)`

Lista subscrições do usuário autenticado.

```typescript
import { listarMinhasSubscricoes } from '@/services/notificacao-api'

const subscricoes = await listarMinhasSubscricoes(1, 20, 'contratos')

// Response
{
  items: [
    {
      id: 'sub-1',
      sistemaId: 'contratos',
      entidadeOrigemId: 'contrato-1',
      ativa: true,
      criadoEm: '2025-01-23T10:00:00Z'
    }
  ],
  page: 1,
  pageSize: 20,
  total: 5
}
```

**Endpoint:** `GET /api/subscricoes/minhas`

#### 4. `criarSubscricao(subscricao)`

Cria subscrição diretamente (alternativa ao toggle).

```typescript
import { criarSubscricao } from '@/services/notificacao-api'

const subscricao = await criarSubscricao({
  sistemaId: 'fornecedores',
  entidadeOrigemId: 'fornecedor-456'
})
```

**Endpoint:** `POST /api/subscricoes`

#### 5. `deletarSubscricao(id)`

Remove subscrição permanentemente.

```typescript
import { deletarSubscricao } from '@/services/notificacao-api'

await deletarSubscricao('sub-123')
```

**Endpoint:** `DELETE /api/subscricoes/{id}`

#### 6. `listarSeguidoresEntidade(sistemaId, entidadeOrigemId)`

Lista usuários seguindo uma entidade (útil para admin).

```typescript
import { listarSeguidoresEntidade } from '@/services/notificacao-api'

const seguidores = await listarSeguidoresEntidade('contratos', 'contrato-123')
```

**Endpoint:** `GET /api/subscricoes/entidade/{sistemaId}/{entidadeOrigemId}`

---

## 🎣 Hooks TanStack Query

**Localização:** `src/hooks/use-subscricoes-query.ts`

### Queries

#### `useVerificarSeguindoQuery(sistemaId, entidadeOrigemId, enabled)`

Verifica se o usuário está seguindo uma entidade.

```typescript
import { useVerificarSeguindoQuery } from '@/hooks/use-subscricoes-query'

const { data, isLoading } = useVerificarSeguindoQuery(
  'contratos',
  contratoId
)

if (data?.seguindo) {
  // Usuário está seguindo
}
```

**Features:**
- ✅ Cache de 2 minutos
- ✅ Auto-refetch ao reconectar
- ✅ Pode ser desabilitado com `enabled=false`

#### `useMinhasSubscricoesQuery(filtros, enabled)`

Lista subscrições do usuário.

```typescript
import { useMinhasSubscricoesQuery } from '@/hooks/use-subscricoes-query'

const { data } = useMinhasSubscricoesQuery({
  sistemaId: 'contratos',
  page: 1,
  pageSize: 20
})

data?.items.forEach(sub => {
  console.log(sub.entidadeOrigemId)
})
```

**Filtros disponíveis:**
- `page` - Número da página
- `pageSize` - Itens por página
- `sistemaId` - Filtrar por sistema

### Mutations

#### `useToggleSeguirMutation()`

Toggle seguir/deixar de seguir.

```typescript
import { useToggleSeguirMutation } from '@/hooks/use-subscricoes-query'

const toggleSeguir = useToggleSeguirMutation()

const handleSeguir = () => {
  toggleSeguir.mutate({
    sistemaId: 'contratos',
    entidadeOrigemId: contratoId
  })
}
```

**Features:**
- ✅ **Optimistic update** - UI atualiza imediatamente
- ✅ **Rollback automático** em caso de erro
- ✅ **Toast de feedback** automático
- ✅ **Invalidação de cache** após sucesso

#### `useDeletarSubscricaoMutation()`

Remove subscrição permanentemente.

```typescript
import { useDeletarSubscricaoMutation } from '@/hooks/use-subscricoes-query'

const deletarSubscricao = useDeletarSubscricaoMutation()

const handleRemover = (subscricaoId: string) => {
  deletarSubscricao.mutate(subscricaoId)
}
```

---

## 🎨 Componentes UI

**Localização:** `src/components/botao-seguir.tsx`

### BotaoSeguir (Componente Base)

Componente genérico reutilizável.

```typescript
import { BotaoSeguir } from '@/components/botao-seguir'

<BotaoSeguir
  entidadeOrigemId={id}
  sistemaId="contratos"
  className="ml-4"
/>
```

**Props:**
- `entidadeOrigemId` - ID da entidade (obrigatório)
- `sistemaId` - ID do sistema (obrigatório)
- `className` - Classes CSS adicionais (opcional)
- `apenasIcone` - Mostrar apenas ícone (opcional, padrão: false)

**Estados visuais:**

| Estado | Ícone | Cor | Texto |
|--------|-------|-----|-------|
| Não seguindo | `Bell` | Outline | "Seguir" |
| Seguindo | `BellRing` | Verde | "Seguindo" |
| Loading | `Loader2` | - | "Carregando..." |

**Responsividade:**
- **Mobile (< sm):** Apenas ícone
- **Desktop (>= sm):** Ícone + texto

### Variantes Especializadas

#### BotaoSeguirContrato

Pré-configurado para contratos.

```typescript
import { BotaoSeguirContrato } from '@/components/botao-seguir'

<BotaoSeguirContrato contratoId={id} />
```

**Uso no projeto:**
Integrado em `src/modules/Contratos/pages/VisualizacaoContratos/VisualizarContrato.tsx`
Posição: Header da página, à esquerda do contador "dias restantes"

#### BotaoSeguirFornecedor

Pré-configurado para fornecedores.

```typescript
import { BotaoSeguirFornecedor } from '@/components/botao-seguir'

<BotaoSeguirFornecedor fornecedorId={id} />
```

#### BotaoSeguirUnidade

Pré-configurado para unidades.

```typescript
import { BotaoSeguirUnidade } from '@/components/botao-seguir'

<BotaoSeguirUnidade unidadeId={id} />
```

---

## 📝 Tipos TypeScript

**Localização:** `src/types/notificacao.ts`

### Subscricao

```typescript
interface Subscricao {
  id: string
  sistemaId: string
  entidadeOrigemId: string
  ativa: boolean
  criadoEm: string
}
```

### SubscricoesPaginadas

```typescript
interface SubscricoesPaginadas {
  items: Subscricao[]
  page: number
  pageSize: number
  total: number
}
```

### SeguirEntidadeRequest

```typescript
interface SeguirEntidadeRequest {
  sistemaId: string
  entidadeOrigemId: string
}
```

### SeguirEntidadeResponse

```typescript
interface SeguirEntidadeResponse {
  seguindo: boolean
  mensagem: string
  subscricaoId?: string
}
```

### StatusSeguimentoResponse

```typescript
interface StatusSeguimentoResponse {
  seguindo: boolean
  subscricaoId?: string
  criadoEm?: string
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Página de Contrato

```typescript
import { BotaoSeguirContrato } from '@/components/botao-seguir'

export const VisualizarContrato = () => {
  const { contratoId } = useParams()

  return (
    <div className="flex items-center gap-4">
      <h1>Contrato #{contratoId}</h1>

      {/* Botão de seguir */}
      <BotaoSeguirContrato contratoId={contratoId} />

      {/* Resto do conteúdo */}
    </div>
  )
}
```

### Exemplo 2: Lista de Subscrições

```typescript
import { useMinhasSubscricoesQuery } from '@/hooks/use-subscricoes-query'

export const MinhasSubscricoes = () => {
  const { data, isLoading } = useMinhasSubscricoesQuery({
    sistemaId: 'contratos'
  })

  if (isLoading) return <Skeleton />

  return (
    <div>
      <h2>Contratos que estou seguindo</h2>
      {data?.items.map(sub => (
        <div key={sub.id}>
          <Link to={`/contratos/${sub.entidadeOrigemId}`}>
            Contrato {sub.entidadeOrigemId}
          </Link>
          <span>{new Date(sub.criadoEm).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  )
}
```

### Exemplo 3: Toggle Manual

```typescript
import { useToggleSeguirMutation, useVerificarSeguindoQuery } from '@/hooks/use-subscricoes-query'

export const ControleManual = ({ entidadeId }: { entidadeId: string }) => {
  const { data: status } = useVerificarSeguindoQuery('contratos', entidadeId)
  const toggleSeguir = useToggleSeguirMutation()

  const handleToggle = () => {
    toggleSeguir.mutate({
      sistemaId: 'contratos',
      entidadeOrigemId: entidadeId
    })
  }

  return (
    <div>
      <p>Status: {status?.seguindo ? 'Seguindo' : 'Não seguindo'}</p>
      <button onClick={handleToggle} disabled={toggleSeguir.isPending}>
        {status?.seguindo ? 'Deixar de Seguir' : 'Seguir'}
      </button>
    </div>
  )
}
```

---

## 🧪 Testes

### Executar Testes

```bash
# Testes dos hooks
pnpm test src/hooks/__tests__/use-subscricoes-query.test.tsx

# Testes do componente
pnpm test src/components/__tests__/botao-seguir.test.tsx

# Todos os testes de subscrições
pnpm test subscri
```

### Cobertura de Testes

**Hooks** (`use-subscricoes-query.test.tsx`):
- ✅ 12 testes
- ✅ Verificação de status
- ✅ Toggle seguir/deixar de seguir
- ✅ Optimistic updates
- ✅ Rollback em erros
- ✅ Listagem de subscrições

**Componente** (`botao-seguir.test.tsx`):
- ✅ 11 testes
- ✅ Estados visuais (seguindo/não seguindo)
- ✅ Loading states
- ✅ Interações de clique
- ✅ Variantes especializadas
- ✅ Responsividade

**Total: 23 testes passando ✅**

---

## 🔧 Troubleshooting

### Botão não carrega status

**Problema:** Botão fica em loading infinito

**Solução:**
1. Verifique se a API de notificações está rodando
2. Confirme URL em `.env`: `VITE_NOTIFICACOES_API_URL`
3. Verifique console do navegador para erros de CORS
4. Confirme que o token JWT está válido

### Optimistic update não reverte em erro

**Problema:** UI não volta ao estado anterior quando API falha

**Solução:**
- O hook `useToggleSeguirMutation` já implementa rollback automático
- Verifique se está usando o hook corretamente
- Veja console para logs de erro

### Toast não aparece

**Problema:** Feedback visual não é exibido

**Solução:**
1. Confirme que `<Toaster />` do Sonner está no root da aplicação
2. Verifique imports: `import { toast } from 'sonner'`
3. Toasts são automáticos nos hooks - não precisa chamar manualmente

### Subscrições não aparecem na listagem

**Problema:** `useMinhasSubscricoesQuery` retorna vazio

**Solução:**
1. Confirme que realmente há subscrições no backend
2. Verifique filtro `sistemaId` - pode estar bloqueando resultados
3. Teste endpoint diretamente: `GET /api/subscricoes/minhas`

---

## 📚 Referências

- **Hooks de notificações:** `src/hooks/use-notificacoes-query.ts`
- **Componente dropdown:** `src/components/notificacoes-dropdown.tsx`
- **API completa:** `src/services/notificacao-api.ts`
- **Tipos:** `src/types/notificacao.ts`
- **Guia deprecated:** `docs/deprecated/FRONTEND-INTEGRATION-GUIDE api noti.md`

---

**Implementação completa! 🎉**

O sistema de subscrições está pronto para uso em todo o projeto. Basta usar os componentes especializados ou criar novos seguindo os exemplos acima.
