# Módulo Funcionarios - Documentação da Estrutura

## 📁 Visão Geral da Estrutura

```
src/modules/Funcionarios/
├── 📁 components/                    # Componentes do módulo
├── 📁 hooks/                         # Hooks customizados
├── 📁 lib/                           # Utilitários e configurações
├── 📁 pages/                         # Páginas do módulo
├── 📁 services/                      # Serviços de API
├── 📁 types/                         # Definições de tipos
├── 📁 utils/                         # Funções utilitárias
└── 📁 index.ts                       # Exportações principais
```

## 🔧 Componentes

### 📁 components/

Componentes reutilizáveis do módulo de funcionários.

**Status**: Estrutura criada, aguardando implementação.

## 🔌 Hooks

### 📁 hooks/

Hooks customizados para gerenciamento de funcionários.

**Status**: Estrutura criada, aguardando implementação.

## 📄 Páginas

### 📁 pages/

- **`CadastroFuncionarioPage.tsx`** - Página de cadastro de funcionário

## 🌐 Serviços

### 📁 services/

- **`funcionarios-service.ts`** - Serviços de API para funcionários
- **`query-keys.ts`** - Keys do TanStack Query

## 🏷️ Tipos

### 📁 types/

- **`funcionario.ts`** - Interface para funcionário

## 🛠️ Utilitários

### 📁 utils/

Funções utilitárias específicas do módulo.

- **`funcionarios-utils.ts`** - Utilitários para validação e formatação

## 🧪 Testes

Estrutura de testes:

```
utils/
├── __tests__/
│   └── funcionarios-utils.test.ts
```

**Status**: Testes implementados para utilitários. Componentes e páginas aguardando testes.

## 📚 Como Usar

### 1. Serviços de API

```typescript
import {
  obterFuncionarios,
  obterFuncionarioPorId,
} from '@/modules/Funcionarios/services/funcionarios-service'
```

### 2. Tipos

```typescript
import type { Funcionario } from '@/modules/Funcionarios/types/funcionario'
```

### 3. Rotas

```typescript
// Cadastro de funcionário
;/funcionarios/aaacdrrst
```

## 🔄 Fluxo de Dados

```
API (Serviços)
    ↓
Services (funcionarios-service.ts)
    ↓
Componentes (components/)
    ↓
Páginas (pages/)
    ↓
Interface do Usuário
```

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case ou PascalCase (ex: `funcionarios-service.ts`, `CadastroFuncionarioPage.tsx`)
- **Componentes**: PascalCase (ex: `FuncionarioForm`)
- **Funções**: camelCase (ex: `handleCadastrarFuncionario`)
- **Tipos**: PascalCase (ex: `Funcionario`)
- **Hooks**: camelCase com prefixo `use` (ex: `useFuncionario`)

## 🎯 Funcionalidades Planejadas

1. **Cadastro de Funcionários**
   - Formulário de cadastro
   - Validação de dados
   - Integração com API

2. **Listagem de Funcionários** (A implementar)
   - Busca e filtros
   - Tabela com informações principais
   - Paginação

3. **Visualização Detalhada** (A implementar)
   - Informações cadastrais completas
   - Histórico de atividades
   - Contratos vinculados

## 🚧 Status de Desenvolvimento

| Funcionalidade        | Status          |
| --------------------- | --------------- |
| Cadastro              | ✅ Implementado |
| Listagem              | ⏳ Pendente     |
| Visualização          | ⏳ Pendente     |
| Edição                | ⏳ Pendente     |
| Testes de Componentes | ⏳ Pendente     |
| Testes de Serviços    | ⏳ Pendente     |

## 📋 Próximos Passos

1. **Estruturação de sub-módulos**
   - Criar `ListaFuncionarios/`
   - Criar `VisualizacaoFuncionario/`

2. **Implementação de componentes**
   - Tabela de funcionários
   - Formulários de cadastro e edição
   - Cards de visualização

3. **Expansão de testes**
   - Testes para componentes
   - Testes para páginas
   - Testes para serviços

## 📞 Suporte

Para dúvidas sobre a estrutura ou necessidade de modificações:

1. Consulte esta documentação
2. Verifique o módulo de Contratos como referência de estrutura completa
3. Mantenha consistência com as convenções do projeto
4. Siga o padrão de estrutura subdividida ao expandir o módulo
