# 🎨 Design System - Guia de Botões

Este guia apresenta o sistema padronizado de botões do projeto, garantindo consistência visual e experiência de usuário uniforme.

## 📋 Sumário

- [Componente Base Button](#componente-base-button)
- [Variantes Disponíveis](#variantes-disponíveis)
- [Componentes Especializados](#componentes-especializados)
- [Melhores Práticas](#melhores-práticas)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 🔧 Componente Base: Button

### Importação
```tsx
import { Button } from '@/components/ui/button'
```

### Props Disponíveis
```tsx
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info' | 'neutral'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

---

## 🎨 Variantes Disponíveis

### Variantes Principais

| Variante | Uso Recomendado | Aparência |
|----------|-----------------|-----------|
| `default` | Ação principal da página | Fundo escuro, texto claro |
| `secondary` | Ações secundárias | Fundo cinza claro |
| `outline` | Alternativa menos chamativa | Apenas borda |
| `ghost` | Ações sutis, navegação | Sem fundo, hover com destaque |
| `link` | Links estilizados como botão | Sublinhado no hover |

### Variantes Semânticas

| Variante | Contexto | Cor |
|----------|----------|-----|
| `success` | Confirmações, criação | Verde |
| `warning` | Avisos, atenção | Amarelo |
| `info` | Informações, atualizações | Azul |
| `destructive` | Exclusões, ações perigosas | Vermelho |
| `neutral` | Navegação, neutro | Cinza |

### Tamanhos

| Size | Altura | Uso |
|------|--------|-----|
| `sm` | 32px | Botões em tabelas, ações compactas |
| `default` | 36px | Uso geral |
| `lg` | 40px | CTAs importantes |
| `icon` | 36x36px | Apenas ícones |

---

## 🧩 Componentes Especializados

### LoadingButton
Botão com estado de carregamento integrado.

```tsx
import { LoadingButton } from '@/components/ui/button-extended'

<LoadingButton
  loading={isSubmitting}
  loadingText="Salvando..."
  variant="success"
>
  Salvar
</LoadingButton>
```

### ActionButton
Botão para ações rápidas em tabelas/cards.

```tsx
import { ActionButton } from '@/components/ui/button-extended'

<ActionButton
  icon={<Edit className="h-4 w-4" />}
  tooltip="Editar item"
  onClick={handleEdit}
/>
```

### IconButton
Botão apenas com ícone e aria-label obrigatório.

```tsx
import { IconButton } from '@/components/ui/button-extended'

<IconButton
  icon={<Settings className="h-4 w-4" />}
  aria-label="Configurações"
  onClick={openSettings}
/>
```

### ConfirmationButton
Botão que expande para confirmação inline.

```tsx
import { ConfirmationButton } from '@/components/ui/button-extended'

<ConfirmationButton
  variant="destructive"
  onConfirm={handleDelete}
  title="Excluir item"
  description="Esta ação não pode ser desfeita"
>
  Excluir
</ConfirmationButton>
```

### ButtonGroup
Agrupamento de botões relacionados.

```tsx
import { ButtonGroup } from '@/components/ui/button-extended'

<ButtonGroup>
  <Button variant="outline">Anterior</Button>
  <Button variant="outline">Próximo</Button>
</ButtonGroup>
```

### ListButton
Botão otimizado para listas e dropdowns.

```tsx
import { ListButton } from '@/components/ui/button-extended'

<ListButton
  title="João Silva"
  description="Desenvolvedor Frontend"
  avatar={<Avatar src="/avatar.jpg" />}
  trailing={<Badge>Online</Badge>}
  onClick={selectUser}
/>
```

### FloatingActionButton
Botão flutuante para ação principal.

```tsx
import { FloatingActionButton } from '@/components/ui/button-extended'

<FloatingActionButton
  icon={<Plus className="h-6 w-6" />}
  position="bottom-right"
  onClick={createNew}
  aria-label="Criar novo item"
/>
```

---

## ✅ Melhores Práticas

### ✅ Faça

- ✅ Use variantes semânticas (`success`, `destructive`, etc.) para ações específicas
- ✅ Combine `LoadingButton` com estados de loading de APIs
- ✅ Use `size="sm"` para botões em tabelas densas
- ✅ Aplique `aria-label` em botões apenas com ícone
- ✅ Use `ConfirmationButton` para ações destrutivas
- ✅ Agrupe botões relacionados com `ButtonGroup`

### ❌ Evite

- ❌ Classes Tailwind hardcoded (`bg-blue-500`, `hover:bg-red-600`)
- ❌ Elementos `<button>` nativos sem estilização
- ❌ Misturar diferentes tamanhos no mesmo contexto
- ❌ Botões apenas com ícone sem `aria-label`
- ❌ Muitas variantes de cor na mesma interface

---

## 💡 Exemplos de Uso por Contexto

### Formulários
```tsx
// Formulário de criação
<div className="flex gap-2 justify-end">
  <Button variant="outline" onClick={onCancel}>
    Cancelar
  </Button>
  <LoadingButton
    type="submit"
    loading={isSubmitting}
    variant="success"
  >
    Criar
  </LoadingButton>
</div>
```

### Tabelas
```tsx
// Ações em linha de tabela
<div className="flex gap-1">
  <ActionButton
    icon={<Eye className="h-4 w-4" />}
    tooltip="Visualizar"
    onClick={handleView}
  />
  <ActionButton
    icon={<Edit className="h-4 w-4" />}
    tooltip="Editar"
    onClick={handleEdit}
  />
  <ConfirmationButton
    variant="destructive"
    size="sm"
    onConfirm={handleDelete}
  >
    <Trash className="h-4 w-4" />
  </ConfirmationButton>
</div>
```

### Navegação
```tsx
// Paginação
<ButtonGroup>
  <Button
    variant="outline"
    disabled={currentPage === 1}
    onClick={previousPage}
  >
    Anterior
  </Button>
  <Button
    variant="outline"
    disabled={!hasNextPage}
    onClick={nextPage}
  >
    Próxima
  </Button>
</ButtonGroup>
```

### Dashboards
```tsx
// Filtros e ações principais
<div className="flex items-center gap-4">
  <Button variant="ghost" size="sm">
    <Filter className="h-4 w-4 mr-2" />
    Filtros
  </Button>
  
  <Button variant="outline" onClick={exportData}>
    <Download className="h-4 w-4 mr-2" />
    Exportar
  </Button>
  
  <Button variant="default" onClick={createNew}>
    <Plus className="h-4 w-4 mr-2" />
    Novo
  </Button>
</div>
```

---

## 🔧 Customização

### CSS Variables
O sistema usa CSS custom properties para facilitar temas:

```css
:root {
  --color-primary: oklch(0.205 0 0);
  --color-destructive: oklch(0.577 0.245 27.325);
  --color-success: rgb(34 197 94); /* green-600 */
  --color-warning: rgb(234 179 8); /* yellow-500 */
  --color-info: rgb(37 99 235); /* blue-600 */
}
```

### Extensão de Variantes
Para adicionar novas variantes, edite `src/components/ui/button.tsx`:

```tsx
const buttonVariants = cva(/* ... */, {
  variants: {
    variant: {
      // variantes existentes...
      custom: 'bg-purple-600 text-white hover:bg-purple-700'
    }
  }
})
```

---

## 📦 Estrutura de Arquivos

```
src/components/ui/
├── button.tsx              # Componente base
├── button-extended.tsx     # Componentes especializados  
├── button-guide.md         # Esta documentação
└── __tests__/
    ├── button.test.tsx
    └── button-extended.test.tsx
```

---

## 🐛 Troubleshooting

### Botão não está estilizado
- ✅ Verifique se está importando de `@/components/ui/button`
- ✅ Confirme se não há classes conflitantes

### Loading não aparece
- ✅ Use `LoadingButton` ao invés de `Button`
- ✅ Verifique se a prop `loading` está sendo passada

### Ícone não centralizado
- ✅ Use `size="icon"` para botões apenas com ícone
- ✅ Verifique se o ícone tem `className="h-4 w-4"`

### Acessibilidade
- ✅ Botões apenas com ícone devem ter `aria-label`
- ✅ Estados disabled devem ser claros
- ✅ Focus deve ser visível

---

*Atualizado em: Janeiro 2025*