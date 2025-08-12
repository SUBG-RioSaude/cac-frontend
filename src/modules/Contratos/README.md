# Módulo Contratos - Documentação da Estrutura

## 📁 Visão Geral da Estrutura

```
src/modules/Contratos/
├── 📁 components/                    # Componentes reutilizáveis
│   ├── 📁 CadastroDeContratos/      # Componentes para cadastro
│   ├── 📁 ListaContratos/           # Componentes para listagem
│   └── 📁 VisualizacaoContratos/    # Componentes para visualização
├── 📁 data/                         # Dados mock e configurações
├── 📁 pages/                        # Páginas principais do módulo
├── 📁 store/                        # Gerenciamento de estado (Zustand)
├── 📁 types/                        # Definições de tipos TypeScript
└── 📁 contratos/                    # Páginas específicas (legado)
```

## 🔧 Componentes (`components/`)

### 📁 CadastroDeContratos/
Componentes responsáveis pelo processo de cadastro de novos contratos.

- **`confirmar-avanco.tsx`** - Modal de confirmação para avançar etapas
- **`contrato-form.tsx`** - Formulário principal de cadastro de contrato
- **`fornecedor-form.tsx`** - Formulário de cadastro de fornecedor
- **`unidades-form.tsx`** - Formulário de configuração de unidades

### 📁 ListaContratos/
Componentes para exibição e gerenciamento da lista de contratos.

- **`filtros-contratos.tsx`** - Filtros avançados para busca
- **`modal-confirmacao-exportacao.tsx`** - Confirmação de exportação
- **`pesquisa-e-filtros.tsx`** - Barra de pesquisa e filtros básicos
- **`tabela-contratos.tsx`** - Tabela responsiva de contratos

### 📁 VisualizacaoContratos/
Componentes para visualização detalhada de contratos.

- **`detalhes-contrato.tsx`** - Aba de detalhes gerais do contrato
- **`indicadores-relatorios.tsx`** - Aba de indicadores e relatórios
- **`registro-alteracoes.tsx`** - Aba de histórico de alterações

## 📊 Dados (`data/`)

### Arquivos de Dados
- **`contratos-data.json`** - **ARQUIVO PRINCIPAL** com todos os dados mock consolidados
- **`contratos-mock.ts`** - Interface TypeScript para importação dos dados JSON
- **`contratos-data.d.ts`** - Declarações de tipos para o arquivo JSON

### Estrutura dos Dados JSON
```json
{
  "contratos": [...],           // Lista de contratos básicos
  "contratoDetalhado": {...},   // Contrato com informações completas
  "unidades": [...],            // Lista de unidades administrativas
  "empresas": {...}             // Dados de empresas fornecedoras
}
```

## 📄 Páginas (`pages/`)

### 📁 CadastroContratos/
- **`cadastrar-contrato.tsx`** - Página principal de cadastro

### 📁 VisualizacaoContratos/
- **`ContratosListPage.tsx`** - Lista principal de contratos
- **`VisualizarContrato.tsx`** - Visualização detalhada de um contrato

## 🗃️ Estado (`store/`)

### Gerenciamento de Estado
- **`contratos-store.ts`** - Store Zustand para estado global dos contratos

## 🏷️ Tipos (`types/`)

### Definições TypeScript
- **`contrato.ts`** - Interface para contrato básico
- **`contrato-detalhado.ts`** - Interface para contrato com todas as informações

## 📋 Páginas Legadas (`contratos/`)

### Páginas em processo de migração
- **`cadastrar-contrato.tsx`** - Versão legada do cadastro

## 🧪 Testes

### Estrutura de Testes
Cada componente possui sua pasta de testes:
```
components/
├── Componente/
│   ├── __tests__/
│   │   └── componente.test.tsx
│   └── componente.tsx
```

## 📚 Como Usar

### 1. Importação de Dados
```typescript
import { 
  contratosMock, 
  contratoDetalhadoMock,
  unidadesMock,
  empresasMock 
} from '@/modules/Contratos/data/contratos-mock'
```

### 2. Tipos Disponíveis
```typescript
import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato-detalhado'
```

### 3. Estado Global
```typescript
import { useContratosStore } from '@/modules/Contratos/store/contratos-store'
```

## 🔄 Fluxo de Dados

```
JSON (contratos-data.json)
    ↓
TypeScript (contratos-mock.ts)
    ↓
Componentes (components/)
    ↓
Páginas (pages/)
    ↓
Interface do Usuário
```

## 🚀 Benefícios da Nova Estrutura

1. **Consolidação**: Todos os dados mock em um único arquivo JSON
2. **Manutenibilidade**: Fácil atualização e gerenciamento de dados
3. **Migração para API**: Formato JSON facilita futura integração
4. **Tipagem**: TypeScript garante consistência dos dados
5. **Organização**: Estrutura clara e lógica de pastas

## 📝 Convenções de Nomenclatura

- **Arquivos**: kebab-case (ex: `contrato-form.tsx`)
- **Componentes**: PascalCase (ex: `ContratoForm`)
- **Funções**: camelCase (ex: `handleSubmit`)
- **Tipos**: PascalCase (ex: `ContratoDetalhado`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)

## 🔍 Busca e Filtros

Para encontrar arquivos específicos:
- **Componentes**: `src/modules/Contratos/components/**/*.tsx`
- **Páginas**: `src/modules/Contratos/pages/**/*.tsx`
- **Tipos**: `src/modules/Contratos/types/*.ts`
- **Dados**: `src/modules/Contratos/data/*`

## 📞 Suporte

Para dúvidas sobre a estrutura ou necessidade de modificações:
1. Verifique primeiro esta documentação
2. Consulte os tipos TypeScript para entender a estrutura dos dados
3. Analise os componentes existentes como referência
4. Mantenha a consistência com as convenções estabelecidas
