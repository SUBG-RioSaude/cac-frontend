# 🛠️ Workflow de Commits - Commitizen & Conventional Commits

## 📋 Visão Geral

Este projeto utiliza **Conventional Commits** com **Commitizen** para padronizar mensagens de commit e melhorar a qualidade do histórico do Git.

## 🚀 Como Fazer Commits

### Opção 1: Commitizen (Recomendado)

```bash
# Comando interativo que guia você pela criação do commit
pnpm commit

# OU usando npx diretamente
npx cz
```

### Opção 2: Git Normal (Fallback)

```bash
# Commit manual seguindo o padrão conventional
git commit -m "feat: nova funcionalidade de login

Implementa sistema de autenticação com JWT e 2FA"
```

## 📝 Formato dos Commits

### Estrutura Básica

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos Disponíveis

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação, sem mudança de lógica
- **refactor**: Refatoração sem nova funcionalidade ou bug fix
- **perf**: Melhoria de performance
- **test**: Adição ou correção de testes
- **build**: Mudanças no sistema de build
- **ci**: Mudanças no CI/CD
- **chore**: Tarefas de manutenção
- **revert**: Reversão de commit
- **hotfix**: Correção crítica
- **wip**: Work in progress (desenvolvimento)

### Exemplos Práticos

```bash
# Nova funcionalidade
feat(auth): implementa autenticação 2FA

# Correção de bug
fix(dashboard): corrige cálculo de métricas

# Documentação
docs: atualiza README com instruções de setup

# Performance
perf(api): otimiza queries do dashboard

# Testes
test(components): adiciona testes para Button component
```

## 🔧 Hooks Configurados

### Pre-commit

- ✅ **ESLint**: Corrige problemas de código automaticamente
- ✅ **Prettier**: Formata código automaticamente
- ✅ **Lint-staged**: Processa apenas arquivos modificados

### Commit-msg

- ✅ **Commitlint**: Valida formato da mensagem
- ✅ **Fallback seguro**: Git normal funciona se seguir o padrão

### Pre-push

- ✅ **Build check**: Verifica se TypeScript compila
- ✅ **Testes**: Executa suite completa de testes
- ✅ **Validação completa**: Garante qualidade antes do push

## 🛡️ Validações Automáticas

### O que acontece em cada commit:

1. **Staging**: Adiciona arquivos com `git add`
2. **Pre-commit**: Lint + Prettier nos arquivos modificados
3. **Commit**: Valida mensagem com commitlint
4. **Sucesso**: Commit criado ✅

### O que acontece em cada push:

1. **Build check**: Verifica compilação TypeScript
2. **Testes**: Executa toda a suite de testes
3. **Sucesso**: Push liberado ✅

## 🚨 Troubleshooting

### Commit bloqueado por mensagem inválida

```bash
# ❌ Erro
git commit -m "mudança no login"

# ✅ Correto
git commit -m "fix(auth): corrige validação do login"
```

### Pre-commit falha no ESLint

```bash
# O ESLint tenta corrigir automaticamente
# Se não conseguir, mostra os erros para correção manual
# Corrija os erros e tente novamente
```

### Pre-push falha no build

```bash
# Verifique erros de TypeScript
pnpm build

# Corrija os erros e tente push novamente
```

### Pre-push falha nos testes

```bash
# Execute testes localmente para debug
pnpm test

# Corrija testes falhando e tente push novamente
```

## 💡 Dicas

### Bypass (Emergency Only)

```bash
# APENAS EM EMERGÊNCIAS - bypass dos hooks
git commit --no-verify -m "hotfix: correção crítica"
git push --no-verify
```

### Conventional Commit Interativo

```bash
# Use o commitizen para ser guiado
pnpm commit

# Responda as perguntas:
# 1. Tipo de mudança (feat, fix, etc.)
# 2. Escopo (opcional)
# 3. Descrição curta
# 4. Descrição longa (opcional)
# 5. Breaking changes (opcional)
```

### Verificar Configuração

```bash
# Testar commitlint
echo "feat: teste" | pnpm exec commitlint

# Testar commitizen
pnpm commit --help

# Ver hooks configurados
ls -la .husky/
```

## 🎯 Benefícios

### Para Desenvolvedores

- ✅ **Commits padronizados** automaticamente
- ✅ **Menos bugs** chegam ao repositório
- ✅ **Feedback imediato** sobre problemas
- ✅ **Workflow consistente** para toda a equipe

### Para o Projeto

- 📊 **Histórico limpo** e legível
- 🔄 **Changelogs automáticos** possíveis
- 🛡️ **Qualidade garantida** em cada commit
- 🚀 **Deploy confiável** com validações

## 🔄 Rollback

Se precisar reverter as configurações:

```bash
# Remover commitizen
pnpm remove commitizen cz-conventional-changelog

# Remover commitlint
pnpm remove @commitlint/cli @commitlint/config-conventional
rm commitlint.config.js

# Remover hooks (manter husky)
rm .husky/commit-msg
git checkout .husky/pre-push  # voltar versão anterior

# Limpar package.json
# Remover: config.commitizen e script "commit"
```

---

> **Nota**: Este sistema é **seguro e não-invasivo**. Git normal continua funcionando, apenas com validações extras para garantir qualidade.
