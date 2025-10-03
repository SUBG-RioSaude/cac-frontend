# Sistema de Fallback API Gateway → Microserviço

## Visão Geral

O sistema implementa um mecanismo de fallback automático onde as requisições tentam primeiro o **API Gateway** e, em caso de falha, fazem fallback automático para o **microserviço direto**.

## Configuração

### Variáveis de Ambiente (.env)

```bash
# Gateway principal (primeira tentativa)
VITE_API_URL="http://devcac:7000/api"

# Microserviço direto (fallback)
VITE_API_URL_CONTRATOS="http://devcac:7000/api"
```

## Como Funciona

### 1. Clientes HTTP

- **`apiGateway`**: Cliente para o gateway (timeout: 5s)
- **`apiDirect`**: Cliente para microserviço direto (timeout: 10s)
- **`api`**: Cliente padrão (para compatibilidade)

### 2. Função de Fallback

```typescript
import { executeWithFallback } from '@/lib/axios'

// Exemplo de uso
const response = await executeWithFallback<ResponseType>({
  method: 'get',
  url: '/Contratos',
  params: { page: 1 },
})
```

### 3. Critérios para Fallback

O fallback é acionado quando o gateway apresenta:

- **Erro de rede/conectividade**
- **Timeout** (>5 segundos)
- **Status 5xx** (erros do servidor)

### 4. Não faz fallback em:

- **Status 4xx** (erros de cliente - Bad Request, Unauthorized, etc.)
- **Erros de validação**

## Monitoramento

### Console Logs

```javascript
[API] Tentando gateway: GET /Contratos
[API] ✅ Gateway respondeu: 200

// Em caso de fallback:
[API] ⚠️ Gateway falhou: Network Error. Tentando microserviço direto...
[API] ✅ Microserviço direto respondeu: 200
```

### Métricas (Desenvolvimento)

No console do navegador (apenas em DEV):

```javascript
// Ver métricas em tempo real
window.apiMetrics.printReport()

// Ver métricas atuais
window.apiMetrics.getMetrics()
```

**Exemplo de relatório:**

```
📊 API Fallback Report
Total de requisições: 45
Gateway - Sucessos: 42
Gateway - Falhas: 3
Direto - Sucessos: 3
Direto - Falhas: 0
Taxa de sucesso do Gateway: 93.33%
Taxa de uso do Fallback: 6.67%
Taxa de sucesso geral: 100%
```

## Integração com React Query

O sistema é **transparente** para os componentes React. Os hooks existentes continuam funcionando normalmente:

```typescript
// Funcionamento automático com fallback
const { data, isLoading } = useContratos(filtros)
```

## Benefícios

1. **✅ Alta Disponibilidade**: Redundância automática
2. **✅ Transparência**: Zero breaking changes
3. **✅ Observabilidade**: Logs e métricas detalhadas
4. **✅ Performance**: Timeout otimizado para fallback rápido
5. **✅ Resiliência**: Manutenção de SLA mesmo com falhas do gateway

## Debugging

### Logs Estruturados

```
[API-METRICS] 2024-01-15T10:30:00.000Z - Gateway Success
[API-METRICS] 2024-01-15T10:30:05.000Z - Gateway Failure { reason: "500 Internal Server Error" }
```

### Status em Tempo Real

```javascript
// Verificar últimas falhas
const metrics = window.apiMetrics.getMetrics()
console.log('Última falha:', metrics.lastFailureTime)
console.log('Motivo:', metrics.lastFailureReason)
```

## Arquivos Modificados

- `src/lib/axios.ts` - Clientes HTTP e lógica de fallback
- `src/lib/api-metrics.ts` - Sistema de métricas
- `src/modules/Contratos/services/contratos-service.ts` - Atualizado para usar fallback
- `src/modules/Contratos/hooks/use-contratos*.ts` - Hooks atualizados

## Testes

Para testar o fallback:

1. **Simular falha do gateway**: Desligar o serviço gateway
2. **Simular timeout**: Adicionar delay no gateway
3. **Verificar logs**: Observar comportamento no console
4. **Verificar métricas**: Usar `window.apiMetrics.printReport()`
