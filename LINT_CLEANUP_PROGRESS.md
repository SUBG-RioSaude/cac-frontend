# 🧹 Catálogo Completo de Correções ESLint - Cac-FrontEnd

## 📊 Status Atual do Projeto
- **Total de problemas**: **1.544** (777 errors, 767 warnings)
- **Redução alcançada**: 76% (de ~6.417 iniciais)
- **Status do servidor**: ✅ Funcionando (sem erros de sintaxe)

---

## 🎯 **ANÁLISE DETALHADA POR CATEGORIA DE ERRO**

### 🔴 **TOP 5 ERROS MAIS CRÍTICOS**

#### 1. **@typescript-eslint/prefer-nullish-coalescing** - 550 ocorrências
- **Descrição**: Uso de `||` ao invés de `??` quando apropriado
- **Impacto**: Médio (pode causar bugs com valores falsy)
- **Estratégia**: Busca e substituição automática + revisão manual
- **Esforço**: ⭐⭐ (Médio)

```bash
# Comando para correção automática:
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/|| \('\''/??\ (/g'
```

#### 2. **@typescript-eslint/no-unnecessary-condition** - 407 ocorrências
- **Descrição**: Condições sempre verdadeiras ou falsas
- **Impacto**: Alto (indica problemas de lógica)
- **Estratégia**: Revisão manual caso por caso
- **Esforço**: ⭐⭐⭐⭐ (Alto)

#### 3. **@typescript-eslint/no-unsafe-assignment** - 80 ocorrências
- **Descrição**: Atribuição de valores `any` não seguros
- **Impacto**: Alto (falta de type safety)
- **Estratégia**: Adicionar tipagem explícita
- **Esforço**: ⭐⭐⭐ (Alto)

#### 4. **@typescript-eslint/no-unsafe-member-access** - 49 ocorrências
- **Descrição**: Acesso a propriedades de tipos `any`
- **Impacto**: Alto (falta de type safety)
- **Estratégia**: Tipar interfaces e objetos
- **Esforço**: ⭐⭐⭐ (Alto)

#### 5. **@typescript-eslint/unbound-method** - 47 ocorrências
- **Descrição**: Métodos não associados a `this`
- **Impacto**: Médio (problemas de escopo)
- **Estratégia**: Adicionar `this: void` ou usar arrow functions
- **Esforço**: ⭐⭐ (Médio)

---

### 🟡 **ERROS DE ESTRUTURA E ORGANIZAÇÃO**

#### **react/no-array-index-key** - 43 ocorrências
- **Problema**: Uso de índices como `key` em listas
- **Solução**: Usar IDs únicos ou criar chaves estáveis
- **Arquivos alvo**: Componentes com `.map()` e listas

#### **jsx-a11y/label-has-associated-control** - 41 ocorrências
- **Problema**: Labels sem controles associados
- **Solução**: Adicionar `htmlFor` ou envolver inputs em labels
- **Prioridade**: Alta (acessibilidade)

#### **@typescript-eslint/no-misused-promises** - 36 ocorrências
- **Problema**: Promises usadas em handlers que esperam void
- **Solução**: Adicionar `void` ou tratar async adequadamente

#### **@typescript-eslint/no-shadow** - 33 ocorrências
- **Problema**: Variáveis com nomes conflitantes
- **Solução**: Renomear variáveis para evitar shadowing

---

## 🗂️ **ARQUIVOS MAIS PROBLEMÁTICOS (TOP 10)**

### **Categoria: Módulo Contratos**
1. **`src/modules/Contratos/components/AlteracoesContratuais/components/BlocosDinamicos/index.tsx`**
   - **Estimativa**: ~80-100 problemas
   - **Tipos principais**: prefer-nullish-coalescing, no-unnecessary-condition
   - **Estratégia**: Refatoração em sessões pequenas (20-30 minutos cada)

2. **`src/modules/Contratos/components/CadastroDeContratos/contrato-form.tsx`**
   - **Estimativa**: ~60-80 problemas
   - **Tipos principais**: prefer-nullish-coalescing, unbound-method
   - **Estratégia**: Focar em correções automáticas primeiro

3. **`src/modules/Contratos/hooks/useAlteracoesContratuais.ts`**
   - **Estimativa**: ~40-60 problemas
   - **Tipos principais**: prefer-nullish-coalescing, no-unsafe-assignment
   - **Estratégia**: Melhorar tipagem + correções automáticas

### **Categoria: Utilitários**
4. **`src/lib/utils.ts`**
   - **Estimativa**: ~40-50 problemas
   - **Tipos principais**: no-unnecessary-condition, prefer-nullish-coalescing
   - **Estratégia**: Prioridade alta (usado em todo projeto)

### **Categoria: Testes**
5. **Arquivos `__tests__/*.tsx`** (vários arquivos)
   - **Estimativa**: ~30-40 problemas cada
   - **Tipos principais**: import/order, unbound-method
   - **Estratégia**: Aplicar correções em lote

---

## 🛠️ **ESTRATÉGIAS DE CORREÇÃO SEM PERDA DE CONTEXTO**

### **🎯 Estratégia 1: Correções Automáticas Massivas**
**Esforço**: ⭐ | **Tempo**: 30 min | **Risco**: Baixo

```bash
# 1. Aplicar lint --fix em grupos específicos
pnpm lint --fix "src/components/**/*.{ts,tsx}"
pnpm lint --fix "src/hooks/**/*.{ts,tsx}"
pnpm lint --fix "src/lib/**/*.{ts,tsx}"

# 2. Corrigir import/order especificamente
pnpm lint --fix "src/**/__tests__/**/*.{ts,tsx}"

# 3. Busca e substituição para nullish coalescing
find src -name "*.tsx" -o -name "*.ts" -exec sed -i 's/textContent || /textContent ?? /g' {} \;
find src -name "*.tsx" -o -name "*.ts" -exec sed -i 's/\.value || /\.value ?? /g' {} \;
```

### **🎯 Estratégia 2: Correção Modular por Arquivo**
**Esforço**: ⭐⭐⭐ | **Tempo**: 2-3 horas | **Risco**: Médio

**Ordem recomendada:**
1. **`src/lib/utils.ts`** (impacta todo o projeto)
2. **Arquivos de teste** (menos risco de quebrar funcionalidades)
3. **Componentes simples** (UI básicos)
4. **Hooks simples** (sem lógica complexa)
5. **Módulos complexos** (Contratos, etc.)

### **🎯 Estratégia 3: Correção por Tipo de Erro**
**Esforço**: ⭐⭐ | **Tempo**: 1-2 horas | **Risco**: Baixo-Médio

**Ordem de prioridade:**
1. **prefer-nullish-coalescing** → Automática + revisão
2. **import/order** → Automática via lint --fix
3. **jsx-a11y/label-has-associated-control** → Manual com templates
4. **react/no-array-index-key** → Manual com boas práticas
5. **unbound-method** → Manual com `this: void`

### **🎯 Estratégia 4: Sessões Focadas (Recomendada)**
**Esforço**: ⭐⭐ | **Tempo**: 30-45 min/sessão | **Risco**: Baixo

**Planejamento de sessões:**

#### **Sessão 1: Preparação (30 min)**
- Aplicar todas as correções automáticas
- Organizar imports
- Verificar se nada quebrou

#### **Sessão 2: Utilitários Críticos (45 min)**
- `src/lib/utils.ts`
- `src/hooks/use-status-config.ts`
- `src/types/status.ts`

#### **Sessão 3: Componentes UI (30 min)**
- Arquivos em `src/components/ui/`
- Focar em acessibilidade (jsx-a11y)

#### **Sessão 4: Testes (45 min)**
- Corrigir `unbound-method` em arquivos `__tests__/`
- Organizar imports restantes
- Corrigir array keys nos testes

#### **Sessão 5+: Módulos Específicos (45 min cada)**
- Uma sessão por módulo (Contratos, Fornecedores, etc.)
- Focar nos arquivos mais problemáticos primeiro

---

## 📈 **COMANDOS ÚTEIS PARA CORREÇÃO**

### **🔍 Análise e Monitoramento**
```bash
# Ver progresso atual
pnpm lint 2>&1 | tail -1

# Analisar erros por tipo
pnpm lint 2>&1 | grep -o '@typescript-eslint/[a-z-]*' | sort | uniq -c | sort -rn

# Verificar arquivo específico
pnpm lint "caminho/do/arquivo.tsx"

# Contar erros de um tipo específico
pnpm lint 2>&1 | grep "prefer-nullish-coalescing" | wc -l
```

### **⚡ Correções Rápidas**
```bash
# Corrigir tudo que é possível automaticamente
pnpm lint --fix

# Corrigir apenas imports
pnpm lint --fix --ext .ts,.tsx "src/**/*" --rule "import/order"

# Aplicar formatação
pnpm format

# Testar se funciona após correções
timeout 10 pnpm dev
```

### **🎯 Correções Específicas**
```bash
# Substituir padrões comuns de || por ??
sed -i 's/textContent || /textContent ?? /g' arquivo.tsx
sed -i 's/\.value || /\.value ?? /g' arquivo.tsx
sed -i 's/props\.[a-zA-Z]* || /props.& ?? /g' arquivo.tsx

# Corrigir imports React em testes
sed -i '1s/^/import React from '\''react'\''\n/' arquivo.test.tsx
```

---

## 🏁 **METAS DE FINALIZAÇÃO**

### **Meta Imediata (Próxima sessão)**
- ✅ Reduzir para **< 1.200 problemas**
- ✅ Eliminar todos os erros `import/order`
- ✅ Aplicar correções automáticas disponíveis

### **Meta de Curto Prazo (Esta semana)**
- 🎯 Reduzir para **< 800 problemas**
- 🎯 Eliminar 80% dos `prefer-nullish-coalescing`
- 🎯 Corrigir todos os arquivos `src/lib/` e `src/hooks/`

### **Meta de Médio Prazo (Próxima semana)**
- 🎯 Reduzir para **< 400 problemas**
- 🎯 Concluir módulo Contratos
- 🎯 Finalizar correções de acessibilidade

### **Meta Final**
- 🏆 **0 errors, 0 warnings**
- 🏆 Build passando sem avisos
- 🏆 Testes executando sem problemas de lint

---

## 📋 **CHECKLIST DE CORREÇÃO POR SESSÃO**

### ✅ **Antes de Iniciar uma Sessão**
- [ ] `git status` - verificar estado limpo
- [ ] `pnpm lint 2>&1 | tail -1` - anotar contagem atual
- [ ] Escolher estratégia da sessão
- [ ] Definir limite de tempo (30-45 min máximo)

### ✅ **Durante a Sessão**
- [ ] Focar em um tipo de erro por vez
- [ ] Testar frequentemente: `timeout 10 pnpm dev`
- [ ] Fazer commits pequenos e descritivos
- [ ] Parar se encontrar problema complexo

### ✅ **Após a Sessão**
- [ ] `pnpm lint 2>&1 | tail -1` - anotar nova contagem
- [ ] `pnpm build` - verificar se build funciona
- [ ] Atualizar este arquivo com progresso
- [ ] Commit final da sessão

---

**Última atualização**: 2024-09-24 17:30
**Responsável**: Claude Code
**Status**: Pronto para correções sistemáticas
**Próxima ação recomendada**: Executar Estratégia 1 (Correções Automáticas)