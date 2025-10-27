# 🚀 Guia de Integração Front-end - EGestão Chat

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Conceitos Importantes](#-conceitos-importantes)
- [Gerenciador de Conexão Singleton](#-gerenciador-de-conexão-singleton)
- [Integração React](#-integração-react)
- [Integração Vue](#-integração-vue)
- [Integração Vanilla JS](#-integração-vanilla-js)
- [Múltiplas Salas Simultâneas](#-múltiplas-salas-simultâneas)
- [Reconexão Automática](#-reconexão-automática)
- [Boas Práticas](#-boas-práticas)

---

## 🎯 Visão Geral

Este guia mostra como integrar o chat em tempo real de forma **invisível para o usuário**. O fluxo ideal é:

1. Usuário abre um contrato
2. Frontend faz join automático na sala (invisível)
3. Usuário vê mensagens antigas (REST API) + novas (SignalR)
4. Ao fechar/navegar, faz leave automático

**Usuário nunca clica em "Entrar na Sala"** - isso é transparente!

---

## 💡 Conceitos Importantes

### **Sala (Room) = Contrato**
- Cada contrato tem uma sala única: `{sistemaId}:{contratoId}`
- Apenas usuários na mesma sala recebem as mensagens
- Um usuário pode estar em múltiplas salas ao mesmo tempo

### **Join Invisível**
- O join acontece automaticamente quando o componente de chat monta
- O leave acontece quando o componente desmonta
- Totalmente transparente para o usuário

### **Conexão Global**
- **Uma única conexão SignalR** para toda a aplicação
- **Múltiplas salas** na mesma conexão
- Gerenciador singleton compartilhado

---

## 🔧 Gerenciador de Conexão Singleton

### **JavaScript/TypeScript**

```javascript
// services/signalRManager.js
import * as signalR from '@microsoft/signalr';

class SignalRManager {
  constructor() {
    this.connection = null;
    this.activeSalas = new Set(); // Rastreia salas ativas
    this.isConnecting = false;
    this.messageHandlers = new Map(); // Handlers por sala
  }

  async initialize(authToken) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.isConnecting) {
      // Aguardar conexão em andamento
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.connection;
    }

    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('/chathub', {
          accessTokenFactory: () => authToken
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            // Exponential backoff: 0s, 2s, 10s, 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.setupEventHandlers();

      await this.connection.start();
      console.log('✅ SignalR conectado');

      return this.connection;
    } catch (error) {
      console.error('❌ Erro ao conectar SignalR:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  setupEventHandlers() {
    // Reconexão: re-join em todas as salas ativas
    this.connection.onreconnecting((error) => {
      console.warn('🔄 Reconectando SignalR...', error);
    });

    this.connection.onreconnected(async (connectionId) => {
      console.log('✅ Reconectado! Re-joining salas...', connectionId);
      await this.rejoinAllRooms();
    });

    this.connection.onclose((error) => {
      console.error('❌ Conexão SignalR fechada', error);
      this.activeSalas.clear();
    });

    // Handler global de mensagens
    this.connection.on('ReceiveMessage', (mensagem) => {
      const roomKey = `${mensagem.sistemaId}:${mensagem.entidadeOrigemId}`;
      const handlers = this.messageHandlers.get(roomKey) || [];
      handlers.forEach(handler => handler(mensagem));
    });

    // Outros eventos globais
    this.connection.on('UserJoined', (data) => {
      console.log('👋 Usuário entrou na sala:', data);
    });

    this.connection.on('UserLeft', (data) => {
      console.log('👋 Usuário saiu da sala:', data);
    });

    this.connection.on('UserTyping', (data) => {
      console.log('💭 Usuário digitando:', data);
    });

    this.connection.on('JoinedRoom', (data) => {
      console.log('✅ Entrou na sala:', data);
    });

    this.connection.on('LeftRoom', (data) => {
      console.log('⬅️ Saiu da sala:', data);
    });

    this.connection.on('Error', (error) => {
      console.error('❌ Erro SignalR:', error);
    });
  }

  async joinRoom(sistemaId, contratoId) {
    const roomKey = `${sistemaId}:${contratoId}`;

    // Evita join duplicado
    if (this.activeSalas.has(roomKey)) {
      console.log('⚠️ Já está na sala:', roomKey);
      return;
    }

    try {
      await this.connection.invoke('JoinContractRoom', sistemaId, contratoId);
      this.activeSalas.add(roomKey);
      console.log('📥 Joined sala:', roomKey);
    } catch (error) {
      console.error('❌ Erro ao entrar na sala:', error);
      throw error;
    }
  }

  async leaveRoom(sistemaId, contratoId) {
    const roomKey = `${sistemaId}:${contratoId}`;

    if (!this.activeSalas.has(roomKey)) {
      return;
    }

    try {
      await this.connection.invoke('LeaveContractRoom', sistemaId, contratoId);
      this.activeSalas.delete(roomKey);
      this.messageHandlers.delete(roomKey);
      console.log('📤 Left sala:', roomKey);
    } catch (error) {
      console.error('❌ Erro ao sair da sala:', error);
    }
  }

  async rejoinAllRooms() {
    const rooms = Array.from(this.activeSalas);

    for (const roomKey of rooms) {
      const [sistemaId, contratoId] = roomKey.split(':');

      try {
        await this.connection.invoke('JoinContractRoom', sistemaId, contratoId);
        console.log('🔄 Re-joined sala:', roomKey);
      } catch (error) {
        console.error('❌ Erro ao re-join sala:', roomKey, error);
        // Remover sala que falhou
        this.activeSalas.delete(roomKey);
      }
    }
  }

  async sendMessage(sistemaId, contratoId, texto, autorId, autorNome) {
    try {
      await this.connection.invoke('SendMessage', {
        sistemaId,
        entidadeOrigemId: contratoId,
        texto,
        autorId,
        autorNome
      });
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async startTyping(sistemaId, contratoId) {
    try {
      await this.connection.invoke('StartTyping', sistemaId, contratoId);
    } catch (error) {
      console.error('❌ Erro ao enviar typing indicator:', error);
    }
  }

  async stopTyping(sistemaId, contratoId) {
    try {
      await this.connection.invoke('StopTyping', sistemaId, contratoId);
    } catch (error) {
      console.error('❌ Erro ao parar typing indicator:', error);
    }
  }

  // Registrar handler para mensagens de uma sala específica
  onMessage(sistemaId, contratoId, handler) {
    const roomKey = `${sistemaId}:${contratoId}`;

    if (!this.messageHandlers.has(roomKey)) {
      this.messageHandlers.set(roomKey, []);
    }

    this.messageHandlers.get(roomKey).push(handler);

    // Retorna função para remover o handler
    return () => {
      const handlers = this.messageHandlers.get(roomKey);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  isConnected() {
    return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
  }

  getActiveSalas() {
    return Array.from(this.activeSalas);
  }
}

// Singleton
export const signalRManager = new SignalRManager();
```

---

## ⚛️ Integração React

### **Hook Customizado**

```typescript
// hooks/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import { signalRManager } from '@/services/signalRManager';

interface UseChatProps {
  sistemaId: string;
  contratoId: string;
  autorId: string;
  autorNome: string;
  authToken: string;
}

export const useChat = ({
  sistemaId,
  contratoId,
  autorId,
  autorNome,
  authToken
}: UseChatProps) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar conexão e entrar na sala
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        // 1. Conectar ao SignalR (se não estiver conectado)
        await signalRManager.initialize(authToken);
        setIsConnected(true);

        // 2. Entrar na sala (join automático invisível)
        await signalRManager.joinRoom(sistemaId, contratoId);

        // 3. Carregar mensagens antigas via REST
        const historico = await fetchMensagensHistorico(sistemaId, contratoId);
        setMensagens(historico);

        // 4. Registrar handler para novas mensagens
        unsubscribe = signalRManager.onMessage(
          sistemaId,
          contratoId,
          (novaMensagem) => {
            setMensagens(prev => [...prev, novaMensagem]);
          }
        );

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
        setIsLoading(false);
      }
    };

    init();

    // Cleanup: sair da sala ao desmontar
    return () => {
      if (unsubscribe) unsubscribe();
      signalRManager.leaveRoom(sistemaId, contratoId);
    };
  }, [sistemaId, contratoId, authToken]);

  // Enviar mensagem
  const enviarMensagem = useCallback(async (texto: string) => {
    if (!texto.trim()) return;

    try {
      await signalRManager.sendMessage(
        sistemaId,
        contratoId,
        texto,
        autorId,
        autorNome
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }, [sistemaId, contratoId, autorId, autorNome]);

  // Indicador de digitação
  const indicarDigitacao = useCallback(() => {
    signalRManager.startTyping(sistemaId, contratoId);

    setTimeout(() => {
      signalRManager.stopTyping(sistemaId, contratoId);
    }, 3000);
  }, [sistemaId, contratoId]);

  return {
    mensagens,
    enviarMensagem,
    indicarDigitacao,
    isConnected,
    isLoading
  };
};

// Helper para carregar histórico
async function fetchMensagensHistorico(sistemaId: string, contratoId: string) {
  const response = await fetch(
    `/api/mensagens/sistema/${sistemaId}/entidade/${contratoId}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );

  return response.json();
}
```

### **Componente de Chat**

```typescript
// components/ChatBox.tsx
import React, { useState } from 'react';
import { useChat } from '@/hooks/useChat';

interface ChatBoxProps {
  sistemaId: string;
  contratoId: string;
  autorId: string;
  autorNome: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  sistemaId,
  contratoId,
  autorId,
  autorNome
}) => {
  const [texto, setTexto] = useState('');
  const authToken = localStorage.getItem('authToken')!;

  const {
    mensagens,
    enviarMensagem,
    indicarDigitacao,
    isConnected,
    isLoading
  } = useChat({ sistemaId, contratoId, autorId, autorNome, authToken });

  const handleEnviar = async () => {
    if (!texto.trim()) return;

    try {
      await enviarMensagem(texto);
      setTexto('');
    } catch (error) {
      alert('Erro ao enviar mensagem');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  if (isLoading) {
    return <div>Carregando chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Observações do Contrato</h3>
        <span className={isConnected ? 'status-online' : 'status-offline'}>
          {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className="chat-messages">
        {mensagens.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.autorNome || msg.autorId}</strong>
            <span className="timestamp">
              {new Date(msg.enviadoEm).toLocaleTimeString()}
            </span>
            <p>{msg.texto}</p>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={indicarDigitacao}
          placeholder="Digite sua observação..."
          maxLength={250}
          disabled={!isConnected}
        />
        <button onClick={handleEnviar} disabled={!isConnected || !texto.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
};
```

---

## 🌿 Integração Vue

### **Composable**

```typescript
// composables/useChat.ts
import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { signalRManager } from '@/services/signalRManager';

export const useChat = (
  sistemaId: string,
  contratoId: string,
  autorId: string,
  autorNome: string,
  authToken: string
) => {
  const mensagens: Ref<Mensagem[]> = ref([]);
  const isConnected = ref(false);
  const isLoading = ref(true);

  let unsubscribe: (() => void) | null = null;

  const init = async () => {
    try {
      await signalRManager.initialize(authToken);
      isConnected.value = true;

      await signalRManager.joinRoom(sistemaId, contratoId);

      const historico = await fetchMensagensHistorico(sistemaId, contratoId);
      mensagens.value = historico;

      unsubscribe = signalRManager.onMessage(
        sistemaId,
        contratoId,
        (novaMensagem) => {
          mensagens.value.push(novaMensagem);
        }
      );

      isLoading.value = false;
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      isLoading.value = false;
    }
  };

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim()) return;

    await signalRManager.sendMessage(
      sistemaId,
      contratoId,
      texto,
      autorId,
      autorNome
    );
  };

  const indicarDigitacao = () => {
    signalRManager.startTyping(sistemaId, contratoId);

    setTimeout(() => {
      signalRManager.stopTyping(sistemaId, contratoId);
    }, 3000);
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
    signalRManager.leaveRoom(sistemaId, contratoId);
  });

  return {
    mensagens,
    enviarMensagem,
    indicarDigitacao,
    isConnected,
    isLoading
  };
};
```

---

## 📦 Integração Vanilla JS

```javascript
// Inicializar quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
  const sistemaId = '123e4567-e89b-12d3-a456-426614174000';
  const contratoId = '123e4567-e89b-12d3-a456-426614174001';
  const authToken = localStorage.getItem('authToken');

  // Conectar e entrar na sala
  await signalRManager.initialize(authToken);
  await signalRManager.joinRoom(sistemaId, contratoId);

  // Carregar histórico
  const mensagens = await fetchMensagensHistorico(sistemaId, contratoId);
  renderMensagens(mensagens);

  // Escutar novas mensagens
  signalRManager.onMessage(sistemaId, contratoId, (mensagem) => {
    addMensagemToUI(mensagem);
  });

  // Enviar mensagem
  document.getElementById('sendBtn').addEventListener('click', async () => {
    const texto = document.getElementById('messageInput').value;
    await signalRManager.sendMessage(
      sistemaId,
      contratoId,
      texto,
      'user123',
      'João Silva'
    );
    document.getElementById('messageInput').value = '';
  });
});

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
  const sistemaId = '123e4567-e89b-12d3-a456-426614174000';
  const contratoId = '123e4567-e89b-12d3-a456-426614174001';
  signalRManager.leaveRoom(sistemaId, contratoId);
});
```

---

## 🔄 Múltiplas Salas Simultâneas

O gerenciador já suporta múltiplas salas automaticamente:

```typescript
// Usuário abre Contrato A
const chatA = useChat({ sistemaId, contratoId: 'contratoA', ... });

// Usuário abre Contrato B (outra aba/componente)
const chatB = useChat({ sistemaId, contratoId: 'contratoB', ... });

// Ambos estão ativos simultaneamente!
// Quando mensagem chega, o handler correto é chamado
```

**Como funciona:**
- Gerenciador rastreia salas em `activeSalas` (Set)
- Cada sala tem seus próprios handlers de mensagem
- Ao receber mensagem, rota para os handlers corretos
- Leave de uma sala não afeta as outras

---

## 🔄 Reconexão Automática

A reconexão é **totalmente automática**:

```javascript
// Configuração já incluída no SignalRManager
.withAutomaticReconnect({
  nextRetryDelayInMilliseconds: retryContext => {
    // 0s, 2s, 10s, 30s (exponential backoff)
    if (retryContext.previousRetryCount === 0) return 0;
    if (retryContext.previousRetryCount === 1) return 2000;
    if (retryContext.previousRetryCount === 2) return 10000;
    return 30000;
  }
})

// Ao reconectar, re-join automático em todas as salas
this.connection.onreconnected(async (connectionId) => {
  await this.rejoinAllRooms();
});
```

**Fluxo:**
1. Conexão cai (internet instável, servidor reiniciou, etc.)
2. SignalR tenta reconectar automaticamente
3. Quando reconecta, `onreconnected` é disparado
4. `rejoinAllRooms()` faz join em todas as salas que estavam ativas
5. Usuário continua de onde parou (transparente!)

---

## ✅ Boas Práticas

### **1. Singleton de Conexão**
✅ **Uma única conexão** SignalR para toda a aplicação
❌ **Não criar** múltiplas conexões por componente

### **2. Join/Leave Automático**
✅ Join ao montar componente
✅ Leave ao desmontar componente
❌ Não exigir ação manual do usuário

### **3. Tratamento de Erros**
```javascript
try {
  await signalRManager.sendMessage(...);
} catch (error) {
  // Mostrar toast/notification
  showError('Erro ao enviar mensagem. Tente novamente.');
}
```

### **4. Loading States**
```typescript
const { isLoading, isConnected } = useChat(...);

if (isLoading) return <Loading />;
if (!isConnected) return <OfflineWarning />;
```

### **5. Otimistic Updates (Opcional)**
```typescript
const enviarMensagem = async (texto: string) => {
  // Adicionar mensagem otimista
  const tempMensagem = { id: 'temp', texto, autorId, ... };
  setMensagens(prev => [...prev, tempMensagem]);

  try {
    await signalRManager.sendMessage(...);
    // SignalR enviará a mensagem oficial com ID real
  } catch (error) {
    // Remover mensagem otimista em caso de erro
    setMensagens(prev => prev.filter(m => m.id !== 'temp'));
    showError('Erro ao enviar');
  }
};
```

### **6. Debounce no Typing Indicator**
```typescript
import { debounce } from 'lodash';

const indicarDigitacao = debounce(() => {
  signalRManager.startTyping(sistemaId, contratoId);

  setTimeout(() => {
    signalRManager.stopTyping(sistemaId, contratoId);
  }, 3000);
}, 1000);
```

### **7. Limpeza de Memória**
```typescript
// Sempre remover handlers ao desmontar
useEffect(() => {
  const unsubscribe = signalRManager.onMessage(...);

  return () => {
    unsubscribe(); // Importante!
    signalRManager.leaveRoom(...);
  };
}, []);
```

### **8. Segurança**
```typescript
// Sempre validar token antes de conectar
const authToken = getValidAuthToken();
if (!authToken) {
  redirectToLogin();
  return;
}

await signalRManager.initialize(authToken);
```

---

## 🎉 Resumo

**O que implementar:**
1. ✅ Gerenciador singleton (`signalRManager.js`)
2. ✅ Hook/Composable customizado (`useChat`)
3. ✅ Join automático ao montar componente
4. ✅ Leave automático ao desmontar
5. ✅ Reconexão com re-join automático

**O que o usuário vê:**
- Abre contrato → Chat funciona
- Fecha contrato → Chat para
- Internet cai → Reconecta sozinho
- Múltiplos contratos → Tudo funciona

**Totalmente invisível e automático!** 🚀
