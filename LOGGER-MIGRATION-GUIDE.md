# Guia de Migração do Sistema de Logging

## Status da Migração

### ✅ Concluído

- **Infraestrutura completa** implementada em `src/lib/logger/`
- **ESLint configurado** para proibir `console.*` (erro)
- **Componentes base migrados:**
  - `ErrorBoundary` → logs estruturados de erro
  - `NavUser` → logs de autenticação e logout
  - `PageBreadcrumb` → logs de navegação

### 🚧 Em Andamento

- **148 console logs restantes** para migrar
- Foco atual em componentes críticos

## Como Usar o Sistema de Logging

### 1. Importação Básica

```typescript
import { createComponentLogger } from '@/lib/logger'

// Dentro do componente/função
const logger = createComponentLogger('NomeComponente', 'modulo')
```

### 2. Factories Especializados

```typescript
import {
  createServiceLogger,
  createHookLogger,
  createModuleLogger,
} from '@/lib/logger'

// Para services
const logger = createServiceLogger('contratos-service')

// Para hooks
const logger = createHookLogger('use-auth', 'hooks')

// Para módulos
const logger = createModuleLogger('Dashboard', 'DashboardPage')
```

### 3. Padrões de Substituição

#### Console.log → logger.debug/info

```typescript
// ❌ Antes
console.log('Dados carregados:', data)

// ✅ Depois
logger.debug({ data }, 'Dados carregados')
```

#### Console.error → logger.error

```typescript
// ❌ Antes
console.error('Erro na API:', error)

// ✅ Depois
logger.error(
  {
    error: error.message,
    stack: error.stack,
    module: 'api',
  },
  'Erro na API',
)
```

#### Console.warn → logger.warn

```typescript
// ❌ Antes
console.warn('Atenção: performance lenta')

// ✅ Depois
logger.warn(
  {
    performance: 'slow',
    threshold: '> 1s',
  },
  'Atenção: performance lenta',
)
```

### 4. Contextos Estruturados

#### Dados de Negócio

```typescript
logger.info(
  {
    contractId: '123',
    userId: '456',
    action: 'create',
  },
  'Contrato criado',
)
```

#### Performance

```typescript
const timeEnd = logger.performance.time('operation')
// ... operação
timeEnd() // Log automático com duração
```

#### Errors com Context

```typescript
logger.error(
  {
    userId: user.id,
    operation: 'save',
    error: err.message,
    stack: err.stack,
  },
  'Falha ao salvar',
)
```

## Priorização da Migração

### 🔴 ALTA PRIORIDADE

1. **Error boundaries e tratamento de erro**
2. **Services de API** (contratos, auth, etc.)
3. **Hooks de estado global** (auth, data fetching)

### 🟡 MÉDIA PRIORIDADE

1. **Componentes de formulário**
2. **Páginas de módulos de negócio**
3. **Utilities e helpers**

### 🟢 BAIXA PRIORIDADE

1. **Componentes de UI puros**
2. **Testes unitários**
3. **Debug temporário**

## Arquivos com Mais Console Logs

### Services (Critical)

- `src/modules/Contratos/services/contratos-service.ts`
- `src/modules/Dashboard/services/dashboard-service.ts`
- `src/modules/Funcionarios/services/funcionarios-service.ts`
- `src/modules/Unidades/services/unidades-service.ts`

### Components (High Priority)

- `src/modules/Contratos/components/AlteracoesContratuais/`
- `src/modules/Contratos/components/CadastroDeContratos/`
- `src/modules/Dashboard/components/`

### Hooks (High Priority)

- `src/modules/Empresas/hooks/use-empresas.ts`
- Outros hooks de negócio

## Benefícios Já Implementados

### 1. Estruturação Automática

- Logs incluem módulo, componente e timestamp
- Context automático (app, environment, user)
- Formatação consistente

### 2. Níveis Inteligentes

- **Development:** Debug detalhado
- **Production:** Info+ apenas
- **Test:** Silenciado

### 3. Performance Tracking

```typescript
// Timing automático
const timeEnd = logger.performance.time('api-call')
await apiCall()
timeEnd() // → "api-call took 234ms"
```

### 4. Error Enrichment

```typescript
// Stack traces estruturados
logger.error(error, 'Contexto do erro')
// → Inclui automaticamente stack, name, message
```

## Próximos Passos

### Fase 2: Services (4-6 horas)

- Migrar todos os services de API
- Adicionar performance tracking
- Logs estruturados de requests/responses

### Fase 3: Hooks de Negócio (3-4 horas)

- use-auth, use-contratos, use-dashboard
- Context automático de usuário
- Error tracking para operations

### Fase 4: Components Restantes (6-8 horas)

- Formulários complexos
- Páginas de módulos
- Componentes de listagem

## Validation

### ESLint Check

```bash
pnpm lint --quiet 2>&1 | grep "no-console" | wc -l
# Target: 0 erros
```

### Runtime Check

- Verificar logs no DevTools
- Testar formatação em diferentes ambientes
- Validar performance tracking

---

**Progresso:** 3/151 componentes migrados (2%)
**Meta:** 100% dos console logs migrados
**Benefício:** Logging profissional e estruturado
