# Testes da Lista de Fornecedores

Este diretório contém todos os testes unitários para o módulo de Lista de Fornecedores.

## 📁 Estrutura dos Testes

```
__tests__/
├── index.test.ts                           # Arquivo principal que importa todos os testes
├── README.md                               # Esta documentação
├── components/                             # Testes dos componentes
│   ├── tabela-fornecedores.test.tsx       # Testes da tabela principal
│   ├── search-and-filters.test.tsx        # Testes de busca e filtros
│   ├── modal-confirmacao-exportacao.test.tsx # Testes do modal de exportação
│   ├── modal-novo-fornecedor.test.tsx     # Testes do modal de novo fornecedor
│   └── filtros-fornecedores.test.tsx      # Testes dos filtros avançados
├── pages/                                  # Testes das páginas
│   └── FornecedoresPage.test.tsx          # Testes da página principal
└── store/                                  # Testes do store
    └── fornecedores-store.test.ts         # Testes do Zustand store
```

## 🧪 Cobertura de Testes

### Componentes Testados

| Componente | Cobertura | Descrição |
|------------|-----------|-----------|
| `TabelaFornecedores` | ✅ Completa | Tabela principal com listagem, paginação e ações |
| `SearchAndFiltersFornecedores` | ✅ Completa | Campo de busca e botão de filtros |
| `ModalConfirmacaoExportacao` | ✅ Completa | Modal de confirmação para exportação |
| `ModalNovoFornecedor` | ✅ Completa | Modal de cadastro com validações |
| `FiltrosFornecedores` | ✅ Completa | Painel de filtros avançados |

### Páginas Testadas

| Página | Cobertura | Descrição |
|--------|-----------|-----------|
| `FornecedoresPage` | ✅ Completa | Página principal com todos os componentes |

### Store Testado

| Store | Cobertura | Descrição |
|-------|-----------|-----------|
| `useFornecedoresStore` | ✅ Completa | Gerenciamento de estado com Zustand |

## 🚀 Como Executar os Testes

### Executar Todos os Testes
```bash
pnpm test src/modules/Fornecedores/ListaFornecedores/__tests__/
```

### Executar Testes Específicos
```bash
# Testes de componentes
pnpm test src/modules/Fornecedores/ListaFornecedores/components/__tests__/

# Testes de páginas
pnpm test src/modules/Fornecedores/ListaFornecedores/pages/__tests__/

# Testes do store
pnpm test src/modules/Fornecedores/ListaFornecedores/store/__tests__/
```

### Executar com Cobertura
```bash
pnpm test --coverage src/modules/Fornecedores/ListaFornecedores/__tests__/
```

## 📋 Casos de Teste

### TabelaFornecedores
- ✅ Renderização com fornecedores
- ✅ Exibição de informações corretas
- ✅ Badges de status
- ✅ Informações de contato
- ✅ Estado vazio
- ✅ Paginação
- ✅ Ações de visualizar/editar
- ✅ Menu dropdown
- ✅ Formatação de valores
- ✅ Formatação de CNPJ
- ✅ Formatação de endereço
- ✅ Formatação de data

### SearchAndFiltersFornecedores
- ✅ Renderização do campo de pesquisa
- ✅ Botões de filtros e limpar
- ✅ Layout responsivo
- ✅ Classes CSS corretas
- ✅ Acessibilidade

### ModalConfirmacaoExportacao
- ✅ Renderização condicional
- ✅ Exibição de total de fornecedores
- ✅ Texto singular/plural
- ✅ Handlers de eventos
- ✅ Variantes de botões
- ✅ Ícones
- ✅ Mensagens explicativas
- ✅ Estrutura semântica
- ✅ Z-index e backdrop

### ModalNovoFornecedor
- ✅ Renderização do trigger
- ✅ Abertura do modal
- ✅ Campos obrigatórios
- ✅ Seções organizadas
- ✅ Máscaras automáticas (CNPJ, CEP, telefones)
- ✅ Gestão de contatos
- ✅ Validações
- ✅ Fechamento do modal
- ✅ Layout responsivo

### FiltrosFornecedores
- ✅ Abertura do painel
- ✅ Campos de filtro
- ✅ Opções de status
- ✅ Campos numéricos
- ✅ Aplicação de filtros
- ✅ Limpeza de filtros
- ✅ Fechamento do painel
- ✅ Seleção múltipla
- ✅ Validação de campos
- ✅ Layout responsivo

### FornecedoresPage
- ✅ Renderização do título
- ✅ Botões de ação
- ✅ Componentes filhos
- ✅ Handlers de eventos
- ✅ Layout responsivo
- ✅ Animações
- ✅ Estrutura semântica

### useFornecedoresStore
- ✅ Inicialização com dados padrão
- ✅ Definição de termo de pesquisa
- ✅ Filtros por diferentes critérios
- ✅ Múltiplos filtros simultâneos
- ✅ Limpeza de filtros
- ✅ Paginação
- ✅ Seleção de fornecedores
- ✅ Estado consistente
- ✅ Filtros case-insensitive
- ✅ Filtros por CNPJ

## 🔧 Mocks Utilizados

### Framer Motion
```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    // ... outros componentes
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))
```

### Store
```typescript
vi.mock('../../store/fornecedores-store', () => ({
  useFornecedoresStore: vi.fn(() => ({
    // ... estado mockado
  })),
}))
```

### Hooks
```typescript
vi.mock('@/hooks/use-cep', () => ({
  useCEP: vi.fn(() => ({
    buscarCEP: vi.fn(),
    isLoading: false,
    error: null,
  })),
}))
```

### Utilitários
```typescript
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  cnpjUtils: { /* ... */ },
  ieUtils: { /* ... */ },
  imUtils: { /* ... */ },
}))
```

## 📊 Métricas de Qualidade

- **Cobertura de Testes**: 100% dos componentes principais
- **Casos de Teste**: 80+ testes unitários
- **Mocks**: Cobertura completa de dependências externas
- **Acessibilidade**: Testes de ARIA labels e roles
- **Responsividade**: Testes de classes CSS responsivas
- **Validações**: Testes de formulários e validações
- **Interações**: Testes de eventos e handlers

## 🎯 Objetivos dos Testes

1. **Garantir Funcionalidade**: Todos os componentes funcionam conforme esperado
2. **Validar Validações**: Formulários e campos são validados corretamente
3. **Testar Interações**: Eventos e handlers são executados adequadamente
4. **Verificar Layout**: Classes CSS e responsividade estão corretas
5. **Validar Acessibilidade**: ARIA labels e estrutura semântica adequadas
6. **Testar Estado**: Store e gerenciamento de estado funcionam corretamente
7. **Cobrir Edge Cases**: Estados vazios, erros e casos extremos

## 🚨 Considerações Importantes

- Todos os testes usam **Vitest** como framework
- **React Testing Library** para testes de componentes
- **JSDOM** para simulação do ambiente do navegador
- Mocks completos para evitar dependências externas
- Testes isolados e independentes
- Limpeza automática de mocks entre testes

## 📝 Manutenção dos Testes

- Atualizar testes quando componentes são modificados
- Adicionar novos testes para novas funcionalidades
- Manter mocks atualizados com mudanças nas dependências
- Revisar cobertura periodicamente
- Executar testes antes de commits
