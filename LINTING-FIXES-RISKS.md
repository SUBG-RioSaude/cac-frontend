# Relatório de Correções de Linting - Riscos e Análise

## Resumo Executivo

- **Erros iniciais:** 145
- **Erros após ignorar shadcn/ui:** 141 (-4 erros)
- **Erros após auto-fix:** 86 (-55 erros)
- **Erros após correções manuais:** 85 (-1 erro)
- **Redução total:** 60 erros (41.4%)

## Configurações Aplicadas

### 1. Componentes shadcn/ui Ignorados

Adicionados ao `eslint.config.js`:

```javascript
;('src/components/ui/**/*.tsx',
  'src/components/ui/**/*.ts',
  '!src/components/ui/__tests__/**/*')
```

**Justificativa:** Componentes base do shadcn/ui não devem ser modificados.

### 2. Auto-fix Aplicado

Executado `pnpm lint --fix` que corrigiu automaticamente:

- `prefer-const` - Variáveis nunca reatribuídas
- `@typescript-eslint/no-unnecessary-type-assertion` - Type assertions desnecessárias
- Formatação e espaçamento

## Erros Restantes por Categoria

### 1. Métodos Desvinculados em Testes (36 erros)

**Tipo:** `@typescript-eslint/unbound-method`
**Arquivos afetados:**

- `src/hooks/__tests__/use-auth.test.ts` (7 erros)
- `src/lib/auth/__tests__/auth-store.test.ts` (8 erros)
- `src/modules/Contratos/services/__tests__/contratos-service.test.ts` (17 erros)
- `src/modules/Unidades/services/__tests__/unidades-service.test.ts` (4 erros)

**Risco:** ⚠️ **MÉDIO** - Correções podem alterar comportamento de testes
**Solução:** Usar `.bind()` ou arrow functions em expect statements

### 2. Argumentos `any` Não Seguros (17 erros)

**Tipo:** `@typescript-eslint/no-unsafe-argument`
**Arquivos afetados:**

- `src/hooks/__tests__/use-status-config.test.ts` (4 erros)
- `src/modules/Contratos/hooks/use-debug-cadastro.ts` (1 erro)
- `src/modules/Dashboard/utils/__tests__/dashboard-utils.test.ts` (1 erro)
- `src/modules/Funcionarios/utils/__tests__/funcionario-utils.test.ts` (4 erros)
- Vários outros arquivos de teste

**Risco:** ⚠️ **MÉDIO** - Tipagem específica necessária para type safety
**Solução:** Definir tipos explícitos ao invés de `any`

### 3. Problemas de String Template (27 erros)

**Tipo:** `@typescript-eslint/no-base-to-string`
**Arquivos afetados:**

- `src/modules/Contratos/hooks/use-historico-funcionarios.ts` (9 erros)
- Outros hooks relacionados a histórico

**Risco:** 🔴 **ALTO** - Pode afetar formatação de dados
**Solução:** Verificar se objetos estão sendo serializados corretamente

### 4. Outros Erros Específicos (6 erros)

- **`no-empty`:** Blocos vazios em testes
- **`@typescript-eslint/no-redundant-type-constituents`:** Tipos redundantes
- Diversos erros pontuais

## Recomendações de Correção

### Prioridade ALTA 🔴

1. **Problemas de String Template:** Verificar formatação de objetos em templates
2. **Type Safety:** Substituir `any` por tipos específicos em pontos críticos

### Prioridade MÉDIA ⚠️

1. **Métodos de Teste:** Corrigir usando `.bind()` ou arrow functions
2. **Tipos Redundantes:** Limpar definições de tipo

### Prioridade BAIXA 🟡

1. **Blocos Vazios:** Adicionar comentários ou implementação
2. **Linting de UI Tests:** Considerar relaxar rules para testes de componentes

## Arquivos que Não Devem Ser Modificados

### Componentes Base shadcn/ui (IGNORADOS)

- `src/components/ui/*.tsx` - Componentes de terceiros
- Mantidos testes customizados em `src/components/ui/__tests__/`

## Riscos de Funcionalidade

### 🔴 ALTO RISCO

- **Formatação de Dados:** Correções em string templates podem alterar exibição
- **Type Safety:** Mudanças de `any` podem revelar bugs existentes

### ⚠️ MÉDIO RISCO

- **Testes:** Alterações podem quebrar asserções existentes
- **Estado Global:** Mudanças em stores podem afetar fluxos

### 🟡 BAIXO RISCO

- **Formatação:** Mudanças de `let` para `const`
- **Type Assertions:** Remoção de assertions desnecessárias

## Próximos Passos Recomendados

1. **Testar aplicação** após cada batch de correções
2. **Executar suite de testes** para verificar quebras
3. **Revisar formatação** de dados em hooks de histórico
4. **Considerar regras específicas** para arquivos de teste
5. **Documentar mudanças** que alteram comportamento

## Correções Manuais Aplicadas

### ✅ Corrigidos

1. **Bloco vazio em teste:** Adicionado comentário explicativo no wait loop
2. **Tipo redundante:** Removido `'todos'` de union type já coberto por `string`
3. **Type assertions em testes:** Corrigidos 4 casos para usar tipos específicos

---

**Gerado em:** 2025-09-23
**Autor:** Correções automáticas e manuais de linting
**Status:** 85 erros restantes (principalmente unbound methods e string templates)
**Recomendação:** Os erros restantes requerem análise cuidadosa para evitar quebra de funcionalidades
