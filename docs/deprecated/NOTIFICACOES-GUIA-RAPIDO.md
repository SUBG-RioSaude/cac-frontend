# 🚀 Guia Rápido - Sistema de Notificações

## ✅ Status da Implementação

**Versão:** 1.0.0  
**Data:** 2025-01-23  
**Status:** ✅ Completo e Pronto para Uso

---

## 📦 O Que Foi Implementado

### **Core Funcional**
- ✅ **TanStack Query** - Gerenciamento de estado servidor (substituindo Zustand)
- ✅ **SignalR** - Notificações em tempo real via WebSocket
- ✅ **API REST Client** - 23 endpoints implementados
- ✅ **Otimistic Updates** - UI responde antes da API confirmar
- ✅ **Auto-arquivamento** - Notificações 30+ dias arquivadas automaticamente

### **UX e Interface**
- ✅ **Dropdown de Notificações** - Com 3 abas (Todas | Não lidas | Arquivo)
- ✅ **Modal de Preferências** - Configuração completa de sons e notificações
- ✅ **Sons de Notificação** - Com controle de volume
- ✅ **Notificações Nativas** - Integração com API do navegador
- ✅ **Loading States** - Skeleton loaders e feedback visual
- ✅ **Indicador SignalR** - Status de conexão em tempo real

### **Qualidade**
- ✅ **Testes Unitários** - 3 arquivos de teste criados
- ✅ **TypeScript Strict** - Tipagem completa
- ✅ **Acessibilidade** - ARIA labels, keyboard navigation
- ✅ **Documentação** - Guias completos

---

## 🎯 Como Usar

### **1. Adicionar Som de Notificação**

**Importante:** O sistema precisa de um arquivo de som para funcionar completamente.

```bash
# Baixe um som de notificação gratuito de:
# - https://mixkit.co/free-sound-effects/notification/
# - https://freesound.org/
# - https://notificationsounds.com/

# Salve como:
public/sounds/notification.mp3
```

**Requisitos do arquivo:**
- Formato: MP3
- Tamanho: < 100KB
- Duração: < 2 segundos
- Som discreto e agradável

### **2. Configurar Variáveis de Ambiente**

O arquivo `.env` já foi configurado com:

```env
VITE_NOTIFICACOES_API_URL="http://devcac:7000/api/notificacoes"
VITE_NOTIFICACOES_HUB_URL="http://devcac:7000/api/notificacaohub"
```

**Ajuste se necessário para seu ambiente.**

### **3. Usar no Código**

#### **Exemplo Básico**

```tsx
import { useNotificacoes } from '@/hooks/use-notificacoes'

function MeuComponente() {
  const {
    notificacoes,
    contagemNaoLidas,
    conectado,
    marcarComoLida,
    arquivar,
  } = useNotificacoes()

  return (
    <div>
      <p>Status: {conectado ? '🟢 Online' : '🔴 Offline'}</p>
      <p>{contagemNaoLidas} não lidas</p>

      {notificacoes.map(n => (
        <div key={n.id}>
          <h4>{n.titulo}</h4>
          <p>{n.mensagem}</p>
          <button onClick={() => marcarComoLida(n.id)}>✓</button>
          <button onClick={() => arquivar(n.id)}>📁</button>
        </div>
      ))}
    </div>
  )
}
```

#### **O Dropdown Já Está Integrado**

O componente `NotificacoesDropdown` já está sendo usado em:
- `src/components/layout-authenticated.tsx`

Aparece automaticamente no header de todas as páginas autenticadas.

---

## 🎨 Componentes Disponíveis

### **1. NotificacoesDropdown**

**Localização:** `src/components/notificacoes-dropdown.tsx`

**Funcionalidades:**
- Bell icon com badge de contagem
- Dropdown com 3 abas (Todas | Não lidas | Arquivo)
- Indicador de status SignalR
- Ações: marcar lida, arquivar, remover
- Botão de preferências

**Uso:**
```tsx
import { NotificacoesDropdown } from '@/components/notificacoes-dropdown'

<NotificacoesDropdown />
```

### **2. NotificacoesPreferenciasDialog**

**Localização:** `src/components/notificacoes-preferencias-dialog.tsx`

**Funcionalidades:**
- Toggle som de notificação
- Controle de volume
- Teste de som
- Toggle notificações nativas do navegador
- Solicitar permissão
- Teste de notificação nativa
- Configuração de tipos (via API)

**Uso:**
```tsx
import { NotificacoesPreferenciasDialog } from '@/components/notificacoes-preferencias-dialog'

const [aberto, setAberto] = useState(false)

<NotificacoesPreferenciasDialog 
  aberto={aberto} 
  aoFechar={() => setAberto(false)} 
/>
```

---

## 🔧 Hooks Disponíveis

### **Hook Principal: `useNotificacoes()`**

```tsx
import { useNotificacoes } from '@/hooks/use-notificacoes'

const {
  // Dados
  notificacoes,              // Lista completa (não arquivadas)
  notificacoesNaoLidas,      // Apenas não lidas
  notificacoesVisiveis,      // Primeiras 20 (para dropdown)
  contagemNaoLidas,          // Contagem total
  preferencias,              // Preferências da API
  
  // Estados
  isLoading,                 // Se está carregando
  conectado,                 // Se SignalR conectado
  reconectando,              // Se está reconectando
  statusConexao,             // Status detalhado
  
  // Ações
  marcarComoLida,            // (id) => void
  arquivar,                  // (id) => void
  marcarTodasComoLidas,      // () => void
  arquivarTodasLidas,        // () => void
  deletar,                   // (id) => void
  
  // Controles SignalR
  conectarSignalR,           // () => Promise<void>
  desconectarSignalR,        // () => Promise<void>
} = useNotificacoes()
```

### **Hooks Especializados**

```tsx
// Queries
import { 
  useNotificacoesQuery,
  useContarNaoLidasQuery,
  useNotificacoesArquivadasQuery,
  usePreferenciasQuery,
} from '@/hooks/use-notificacoes-query'

// Mutations
import {
  useMarcarLidaMutation,
  useArquivarMutation,
  useMarcarTodasLidasMutation,
  useAtualizarPreferenciaMutation,
} from '@/hooks/use-notificacoes-query'

// SignalR
import { useNotificacoesSignalR } from '@/hooks/use-notificacoes-signalr'
```

---

## 🔔 Funções Utilitárias

### **Sons**

```tsx
import {
  tocarSomNotificacao,
  habilitarSom,
  desabilitarSom,
  alternarSom,
  definirVolume,
  tocarSomTeste,
} from '@/lib/notification-sound'

// Tocar som
await tocarSomNotificacao()

// Tocar com volume específico
await tocarSomNotificacao(0.8) // 80%

// Configurar
habilitarSom()
definirVolume(0.5)

// Testar
await tocarSomTeste()
```

### **Notificações Nativas**

```tsx
import {
  solicitarPermissao,
  mostrarNotificacao,
  mostrarNotificacaoDeAPI,
  habilitarNotificacoesNativas,
  navegadorSuportaNotificacoes,
} from '@/lib/browser-notifications'

// Solicitar permissão
const concedida = await solicitarPermissao()

// Mostrar notificação
mostrarNotificacao({
  titulo: 'Nova Mensagem',
  mensagem: 'Você tem uma nova mensagem',
  tipo: 'info',
  urlAcao: '/mensagens/123',
})

// A partir de objeto da API
mostrarNotificacaoDeAPI(notificacao)
```

---

## 🧪 Executar Testes

```bash
# Todos os testes
pnpm test

# Testes de notificações
pnpm test notificacao

# Com coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

**Testes criados:**
- `src/services/__tests__/notificacao-api.test.ts` - Testes da API
- `src/hooks/__tests__/use-notificacoes-query.test.ts` - Testes dos hooks
- `src/components/__tests__/notificacoes-dropdown.test.tsx` - Testes do componente

---

## 🐛 Troubleshooting

### **Som não toca**

**Problema:** Arquivo de som não encontrado (erro 404)

**Solução:**
1. Adicione `public/sounds/notification.mp3`
2. Veja instruções em `public/sounds/README.md`

**Problema:** Som não toca mesmo com arquivo presente

**Solução:**
1. Navegadores bloqueiam autoplay até interação do usuário
2. O som só toca após o usuário interagir com a página
3. Use o botão "Testar Som" nas preferências

### **SignalR não conecta**

**Problema:** Status sempre "Offline"

**Solução:**
1. Verifique se a API está rodando
2. Confirme URL em `.env`: `VITE_NOTIFICACOES_HUB_URL`
3. Verifique console do navegador para erros
4. Confirme que o backend suporta WebSockets

### **Notificações nativas não aparecem**

**Problema:** Notificações do navegador não funcionam

**Solução:**
1. Solicite permissão via botão no modal de preferências
2. Verifique se o navegador suporta: `navegadorSuportaNotificacoes()`
3. Em produção, requer HTTPS
4. Algumas extensões de navegador bloqueiam notificações

### **Queries não atualizam**

**Problema:** Dados não atualizam após SignalR receber evento

**Solução:**
1. O hook `useNotificacoesSignalR` invalida queries automaticamente
2. Verifique se está usando o hook `useNotificacoes()` (não os hooks individuais)
3. Veja console para logs de invalidação

---

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      APLICAÇÃO REACT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useNotificacoes()  ──────────────────────────────────────┐│
│         │                                                  ││
│         ├─► useNotificacoesQuery()                        ││
│         │      └─► TanStack Query Cache ◄──┐             ││
│         │                                   │             ││
│         └─► useNotificacoesSignalR()       │             ││
│                 └─► SignalR WebSocket ─────┼─► Invalida ││
│                                             │   Cache    ││
│                                             │             ││
└─────────────────────────────────────────────┼─────────────┘│
                                              │              │
                    ┌─────────────────────────┴──────────────┘
                    │
           ┌────────▼────────┐
           │   API BACKEND   │
           │   (SignalR +    │
           │    REST API)    │
           └─────────────────┘
```

---

## 🎓 Boas Práticas

### **1. Use o Hook Facade**

✅ **Recomendado:**
```tsx
const { notificacoes, marcarComoLida } = useNotificacoes()
```

❌ **Evite:**
```tsx
const { data } = useNotificacoesQuery()
const { mutate } = useMarcarLidaMutation()
// Mais verboso e perde benefícios
```

### **2. Aproveite Estados de Loading**

```tsx
const { isLoading, notificacoes } = useNotificacoes()

if (isLoading) {
  return <Skeleton />
}

return <Lista notificacoes={notificacoes} />
```

### **3. Confie no Cache**

O TanStack Query gerencia cache automaticamente:
- `staleTime: 1min` - Dados frescos por 1 minuto
- Invalidação automática via SignalR
- Refetch ao reconectar internet

### **4. Feedback Visual**

Mutations já mostram toasts automáticos:
- ✅ "Notificação marcada como lida"
- ❌ "Erro ao arquivar notificação"

Use `toast` do `sonner` para feedbacks adicionais.

---

## 📚 Documentação Adicional

- **Guia Completo:** `docs/IMPLEMENTACAO-NOTIFICACOES.md`
- **API Reference:** `docs/FRONTEND-INTEGRATION-GUIDE+api+noti.md`
- **Som Placeholder:** `public/sounds/README.md`

---

## 🆘 Suporte

**Problemas ou dúvidas?**

1. Verifique o console do navegador para erros
2. Consulte a documentação completa
3. Revise os testes para exemplos de uso
4. Verifique se todas as variáveis de ambiente estão configuradas

---

**Implementação completa! 🎉**

O sistema está pronto para uso. Apenas adicione o arquivo de som e comece a receber notificações em tempo real!
