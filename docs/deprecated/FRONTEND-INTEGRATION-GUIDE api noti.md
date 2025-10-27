# Guia de Integração Frontend - API de Notificações

## Visão Geral

Este guia mostra como integrar o frontend (React, Vue, Angular, etc.) com o microserviço de notificações usando:

- **SignalR** para notificações em tempo real
- **REST API** para operações CRUD e preferências
- **JWT** para autenticação de usuários

## Índice

1. [Instalação](#instalação)
2. [Autenticação](#autenticação)
3. [Referência Completa de Endpoints](#referência-completa-de-endpoints)
   - [Notificações Persistentes](#-endpoints-de-notificações)
   - [Broadcasts (Alertas Globais)](#-endpoints-de-broadcasts-alertas-globais)
   - [Preferências](#️-endpoints-de-preferências)
   - [Subscrições](#-endpoints-de-subscrições)
   - [API Keys (Admin)](#-endpoints-de-administração-de-api-keys)
   - [Debug](#-endpoints-de-debug)
4. [SignalR - Notificações em Tempo Real](#signalr---notificações-em-tempo-real)
5. [REST API - Operações CRUD](#rest-api---operações-crud)
6. [Gerenciamento de Preferências](#gerenciamento-de-preferências)
7. [Gerenciamento de Subscrições](#gerenciamento-de-subscrições)
8. [Administração de API Keys](#administração-de-api-keys)
9. [Exemplos Completos](#exemplos-completos)
10. [Tratamento de Erros](#tratamento-de-erros)
11. [Boas Práticas](#boas-práticas)

---

## Instalação

### React/JavaScript

```bash
npm install @microsoft/signalr axios
```

### TypeScript (recomendado)

```bash
npm install @microsoft/signalr axios
npm install -D @types/microsoft__signalr
```

---

## Autenticação

### Obtendo o Token JWT

O token JWT deve ser obtido através do microserviço de autenticação (`egestao-micro-auth-api`). Não é responsabilidade da API de notificações gerar tokens.

```typescript
// Exemplo de autenticação (via microserviço de auth)
async function login(username: string, password: string) {
  const response = await axios.post('https://auth.egestao.com/api/auth/login', {
    username,
    password
  });

  const { token, usuario } = response.data;

  // Salvar token (localStorage, sessionStorage, cookie seguro, etc.)
  localStorage.setItem('jwt_token', token);
  localStorage.setItem('usuario_id', usuario.id);

  return token;
}
```

### Estrutura do Token JWT

O token deve conter os seguintes claims:

```json
{
  "sub": "usuario-id-guid",
  "email": "usuario@example.com",
  "nome": "Nome do Usuário",
  "iss": "egestao-micro-auth-api",
  "aud": "egestao-frontend",
  "exp": 1735689600
}
```

---

## Referência Completa de Endpoints

### 📋 Tabela Resumo de Endpoints

| Categoria | Método | Endpoint | Autenticação | Descrição |
|-----------|--------|----------|--------------|-----------|
| **Health** | GET | `/api/health` | Nenhuma | Verifica saúde do serviço |
| **Notificações** | POST | `/api/notificacoes` | API Key | Cria notificação (microserviços) |
| **Notificações** | GET | `/api/notificacoes/minhas` | JWT | Lista notificações do usuário |
| **Notificações** | GET | `/api/notificacoes/nao-lidas` | JWT | Conta notificações não lidas |
| **Notificações** | PUT | `/api/notificacoes/{id}/marcar-lida` | JWT | Marca notificação como lida |
| **Notificações** | PUT | `/api/notificacoes/{id}/arquivar` | JWT | Arquiva notificação |
| **Notificações** | PUT | `/api/notificacoes/{id}/desarquivar` | JWT | Desarquiva notificação |
| **Notificações** | PUT | `/api/notificacoes/marcar-todas-lidas` | JWT | Marca todas como lidas |
| **Notificações** | PUT | `/api/notificacoes/arquivar-todas-lidas` | JWT | Arquiva todas lidas |
| **Notificações** | GET | `/api/notificacoes/arquivadas` | JWT | Lista notificações arquivadas |
| **Broadcasts** | POST | `/api/notificacoes/broadcast` | API Key | Envia broadcast global (microserviços) |
| **Preferências** | POST | `/api/preferencias` | JWT | Cria preferências |
| **Preferências** | GET | `/api/preferencias/minhas` | JWT | Lista preferências do usuário |
| **Preferências** | PUT | `/api/preferencias/{id}` | JWT | Atualiza preferência |
| **Preferências** | DELETE | `/api/preferencias/{id}` | JWT | Remove preferência |
| **Subscrições** | POST | `/api/subscricoes` | JWT | Cria subscrição (seguir entidade) |
| **Subscrições** | GET | `/api/subscricoes/minhas` | JWT | Lista subscrições do usuário |
| **Subscrições** | GET | `/api/subscricoes/entidade/{sistemaId}/{entidadeId}` | JWT | Lista seguidores de entidade |
| **Subscrições** | DELETE | `/api/subscricoes/{id}` | JWT | Remove subscrição |
| **Subscrições** | POST | `/api/subscricoes/seguir` | JWT | Toggle seguir/deixar de seguir |
| **Subscrições** | GET | `/api/subscricoes/estou-seguindo` | JWT | Verifica status de seguimento |
| **API Keys** | GET | `/api/admin/apikeys` | JWT Admin | Lista todas API Keys |
| **API Keys** | POST | `/api/admin/apikeys` | JWT Admin | Cria nova API Key |
| **API Keys** | DELETE | `/api/admin/apikeys/{id}` | JWT Admin | Desativa API Key |
| **API Keys** | PUT | `/api/admin/apikeys/{id}/reativar` | JWT Admin | Reativa API Key |
| **SignalR** | WS | `/api/notificacaohub` | JWT | Hub SignalR tempo real |

---

### 🏥 Health Check

#### GET `/api/health`

Verifica a saúde do serviço e suas dependências.

**Autenticação:** Nenhuma (endpoint público)

**Response 200:**
```json
{
  "status": "Healthy",
  "service": "EGestao-Notificacao",
  "version": "1.0.0",
  "timestamp": "2025-01-23T10:30:00Z",
  "uptime": "2.05:30:15",
  "dependencies": {
    "database": {
      "status": "Healthy",
      "responseTime": "00:00:00.0123456"
    }
  }
}
```

**Uso em TypeScript:**
```typescript
async function checkHealth() {
  const response = await axios.get('https://notificacoes.egestao.com/api/health');
  return response.data;
}
```

---

### 🔔 Endpoints de Notificações

#### POST `/api/notificacoes`

Cria uma nova notificação. **EXCLUSIVO para microserviços via API Key.**

**Autenticação:** API Key (formato: `ApiKey nome:chave`)

**Request Body:**
```json
{
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "entidadeOrigemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "tipoNotificacao": "vencimento",
  "titulo": "Boleto vencendo em 3 dias",
  "mensagem": "O boleto do contrato #123 vence em 15/01/2025",
  "prioridade": "Urgente",
  "categoria": "Financeiro",
  "urlAcao": "https://app.exemplo.com/contratos/123",
  "metadata": {
    "valorVencimento": 1500.00
  }
}
```

**Response 201:**
```json
{
  "id": "a1b2c3d4-...",
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "titulo": "Boleto vencendo em 3 dias",
  "criadoEm": "2025-01-23T10:30:00Z"
}
```

**Response 403:** (sistemaId não corresponde à API Key)
```json
{
  "error": "SistemaId não corresponde à API Key autenticada",
  "sistemaIdEsperado": "00000000-0000-0000-0000-000000000001",
  "sistemaIdRecebido": "00000000-0000-0000-0000-000000000002"
}
```

---

#### GET `/api/notificacoes/minhas`

Lista notificações do usuário autenticado com paginação.

**Autenticação:** JWT

**Query Params:**
- `page` (opcional, padrão: 1) - Número da página
- `pageSize` (opcional, padrão: 20, máx: 100) - Itens por página

**Response 200:**
```json
{
  "items": [
    {
      "id": "a1b2c3d4-...",
      "notificacaoId": "x1y2z3...",
      "titulo": "Boleto vencendo",
      "mensagem": "Seu boleto vence amanhã",
      "tipo": "warning",
      "prioridade": "Urgente",
      "categoria": "Financeiro",
      "lida": false,
      "lidaEm": null,
      "arquivada": false,
      "arquivadaEm": null,
      "urlAcao": "https://app.exemplo.com/boletos/123",
      "metadata": {},
      "criadoEm": "2025-01-23T10:30:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "naoLidas": 5
}
```

**Uso em TypeScript:**
```typescript
interface NotificacaoUsuario {
  id: string;
  notificacaoId: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  prioridade: string;
  categoria: string;
  lida: boolean;
  lidaEm?: string;
  arquivada: boolean;
  arquivadaEm?: string;
  urlAcao?: string;
  metadata?: Record<string, any>;
  criadoEm: string;
}

async function listarMinhasNotificacoes(page = 1, pageSize = 20) {
  const response = await api.get<{
    items: NotificacaoUsuario[];
    page: number;
    pageSize: number;
    naoLidas: number;
  }>('/notificacoes/minhas', { params: { page, pageSize } });

  return response.data;
}
```

---

#### GET `/api/notificacoes/nao-lidas`

Retorna contagem de notificações não lidas.

**Autenticação:** JWT

**Response 200:**
```json
{
  "naoLidas": 5,
  "porSistema": {
    "00000000-0000-0000-0000-000000000001": 3,
    "00000000-0000-0000-0000-000000000002": 2
  }
}
```

**Uso em TypeScript:**
```typescript
async function contarNaoLidas() {
  const response = await api.get<{
    naoLidas: number;
    porSistema: Record<string, number>;
  }>('/notificacoes/nao-lidas');

  return response.data;
}
```

---

#### PUT `/api/notificacoes/{notificacaoUsuarioId}/marcar-lida`

Marca uma notificação específica como lida.

**Autenticação:** JWT

**Path Params:**
- `notificacaoUsuarioId` - ID da relação NotificacaoUsuario

**Response 200:**
```json
{
  "message": "Notificação marcada como lida"
}
```

**Uso em TypeScript:**
```typescript
async function marcarComoLida(notificacaoUsuarioId: string) {
  await api.put(`/notificacoes/${notificacaoUsuarioId}/marcar-lida`);
}
```

---

#### PUT `/api/notificacoes/{notificacaoUsuarioId}/arquivar`

Arquiva uma notificação.

**Autenticação:** JWT

**Response 200:**
```json
{
  "message": "Notificação arquivada com sucesso"
}
```

**Uso em TypeScript:**
```typescript
async function arquivar(notificacaoUsuarioId: string) {
  await api.put(`/notificacoes/${notificacaoUsuarioId}/arquivar`);
}
```

---

#### PUT `/api/notificacoes/{notificacaoUsuarioId}/desarquivar`

Desarquiva uma notificação.

**Autenticação:** JWT

**Response 200:**
```json
{
  "message": "Notificação desarquivada com sucesso"
}
```

---

#### PUT `/api/notificacoes/marcar-todas-lidas`

Marca todas as notificações como lidas (com filtro opcional).

**Autenticação:** JWT

**Query Params:**
- `sistemaId` (opcional) - Filtra por sistema específico

**Response 200:**
```json
{
  "message": "Todas notificações marcadas como lidas"
}
```

**Uso em TypeScript:**
```typescript
// Marcar todas como lidas
async function marcarTodasComoLidas() {
  await api.put('/notificacoes/marcar-todas-lidas');
}

// Marcar todas de um sistema como lidas
async function marcarTodasComoLidasPorSistema(sistemaId: string) {
  await api.put('/notificacoes/marcar-todas-lidas', null, {
    params: { sistemaId }
  });
}
```

---

#### PUT `/api/notificacoes/arquivar-todas-lidas`

Arquiva todas as notificações lidas.

**Autenticação:** JWT

**Query Params:**
- `sistemaId` (opcional) - Filtra por sistema específico

**Response 200:**
```json
{
  "message": "Notificações lidas arquivadas com sucesso"
}
```

---

#### GET `/api/notificacoes/arquivadas`

Lista notificações arquivadas do usuário.

**Autenticação:** JWT

**Query Params:**
- `page` (opcional, padrão: 1)
- `pageSize` (opcional, padrão: 20)

**Response 200:**
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 20,
  "totalArquivadas": 10
}
```

---

### 📢 Endpoints de Broadcasts (Alertas Globais)

#### POST `/api/notificacoes/broadcast`

**⚠️ EXCLUSIVO PARA MICROSERVIÇOS** - Envia broadcast (alerta global) para todos os usuários conectados em um sistema via SignalR.

**Autenticação:** API Key (microserviços apenas)

**Diferença entre Broadcast e Notificação Normal:**

| Característica | Notificação Normal | Broadcast |
|----------------|-------------------|-----------|
| **Endpoint** | POST /api/notificacoes | POST /api/notificacoes/broadcast |
| **Vinculado a entidade** | ✅ Sim (EntidadeOrigemId) | ❌ Não |
| **Persiste no banco** | ✅ Sim | ❌ Não (temporário) |
| **Quem recebe** | Usuários inscritos na entidade | **Todos conectados no sistema** |
| **Evento SignalR** | `ReceiveNotificacao` | `ReceiveBroadcast` |
| **Aparece em /minhas** | ✅ Sim | ❌ Não |
| **Marca lida/arquiva** | ✅ Sim | ❌ N/A |
| **Caso de uso** | "Contrato aprovado" | "Manutenção programada" |

**Body:**
```json
{
  "sistemaId": "7b8659bb-1aeb-4d74-92c1-110c1d27e576",
  "titulo": "Manutenção programada",
  "mensagem": "O sistema ficará indisponível das 22h às 23h",
  "prioridade": 2,
  "categoria": "Sistema",
  "urlAcao": "https://status.exemplo.com"
}
```

**Response 200:**
```json
{
  "sistemaId": "7b8659bb-1aeb-4d74-92c1-110c1d27e576",
  "titulo": "Manutenção programada",
  "mensagem": "O sistema ficará indisponível das 22h às 23h",
  "prioridade": 2,
  "categoria": "Sistema",
  "urlAcao": "https://status.exemplo.com",
  "criadoEm": "2025-10-24T14:30:00Z",
  "usuariosConectados": 0,
  "info": "Broadcast enviado apenas para usuários conectados no momento"
}
```

**Response 403 (sistemaId não corresponde à API Key):**
```json
{
  "error": "SistemaId não corresponde à API Key autenticada",
  "sistemaIdEsperado": "7b8659bb-1aeb-4d74-92c1-110c1d27e576",
  "sistemaIdRecebido": "00000000-0000-0000-0000-000000000000"
}
```

**⚠️ IMPORTANTE para o Frontend:**

Para receber broadcasts, o frontend **DEVE** se conectar ao grupo do sistema via SignalR:

```typescript
// 1. Conectar ao SignalR
await connection.start();

// 2. Entrar no grupo do sistema (OBRIGATÓRIO)
await connection.invoke("JoinSistema", "7b8659bb-1aeb-4d74-92c1-110c1d27e576");

// 3. Escutar broadcasts
connection.on("ReceiveBroadcast", (broadcast) => {
    console.log("📢 Broadcast recebido:", broadcast);

    // Mostrar toast/alerta
    showToast({
        title: broadcast.titulo,
        message: broadcast.mensagem,
        type: broadcast.prioridade === 2 ? 'warning' : 'info',
        duration: 8000
    });
});

// 4. Ao sair do sistema
await connection.invoke("LeaveSistema", "7b8659bb-1aeb-4d74-92c1-110c1d27e576");
```

**Exemplo completo em React:**

```typescript
import { useEffect } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';

function useBroadcastListener(sistemaId: string, jwtToken: string) {
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('http://localhost:5039/api/notificacaohub', {
                accessTokenFactory: () => jwtToken
            })
            .withAutomaticReconnect()
            .build();

        async function setupConnection() {
            try {
                await connection.start();
                console.log('✅ Conectado ao SignalR');

                // Entrar no grupo do sistema
                await connection.invoke('JoinSistema', sistemaId);
                console.log(`📢 Inscrito para broadcasts do sistema ${sistemaId}`);

                // Escutar broadcasts
                connection.on('ReceiveBroadcast', (broadcast) => {
                    console.log('📢 Broadcast recebido:', broadcast);

                    // Mostrar alerta visual
                    toast.warning(
                        <>
                            <strong>{broadcast.titulo}</strong>
                            <p>{broadcast.mensagem}</p>
                        </>,
                        {
                            position: 'top-center',
                            autoClose: broadcast.prioridade === 2 ? false : 8000,
                            closeOnClick: true
                        }
                    );

                    // Se tiver URL de ação
                    if (broadcast.urlAcao) {
                        toast.info(
                            <a href={broadcast.urlAcao} target="_blank">
                                Ver mais detalhes
                            </a>
                        );
                    }
                });

            } catch (err) {
                console.error('❌ Erro ao conectar SignalR:', err);
            }
        }

        setupConnection();

        // Cleanup
        return () => {
            if (connection) {
                connection.invoke('LeaveSistema', sistemaId).catch(console.error);
                connection.stop();
            }
        };
    }, [sistemaId, jwtToken]);
}

// Uso no componente
function Dashboard() {
    const sistemaId = '7b8659bb-1aeb-4d74-92c1-110c1d27e576';
    const jwtToken = localStorage.getItem('jwt_token')!;

    useBroadcastListener(sistemaId, jwtToken);

    return <div>Dashboard com broadcasts ativos...</div>;
}
```

**Casos de uso comuns:**

```typescript
// 1. Manutenção programada
{
  "titulo": "Manutenção Programada",
  "mensagem": "Sistema indisponível das 22h às 23h para atualização",
  "prioridade": 2,
  "categoria": "Manutenção"
}

// 2. Sistema lento
{
  "titulo": "Performance degradada",
  "mensagem": "Estamos investigando lentidão. Pedimos paciência.",
  "prioridade": 1,
  "categoria": "Performance"
}

// 3. Nova funcionalidade
{
  "titulo": "🎉 Nova funcionalidade!",
  "mensagem": "Agora você pode exportar relatórios em PDF",
  "prioridade": 0,
  "categoria": "Novidade",
  "urlAcao": "https://app.exemplo.com/relatorios"
}

// 4. Alerta crítico
{
  "titulo": "🚨 ATENÇÃO",
  "mensagem": "Sistema será desligado em 5 minutos para manutenção emergencial",
  "prioridade": 2,
  "categoria": "Urgente"
}
```

---

### ⚙️ Endpoints de Preferências

#### POST `/api/preferencias`

Cria preferências de notificação.

**Autenticação:** JWT

**Request Body:**
```json
{
  "usuarioId": "user-guid",  // Será sobrescrito pelo usuário do token
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "tipoNotificacao": "vencimento",
  "habilitada": true
}
```

**Response 201:**
```json
{
  "id": "pref-guid",
  "usuarioId": "user-guid",
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "tipoNotificacao": "vencimento",
  "habilitada": true,
  "criadoEm": "2025-01-23T10:30:00Z"
}
```

---

#### GET `/api/preferencias/minhas`

Lista preferências do usuário autenticado.

**Autenticação:** JWT

**Response 200:**
```json
[
  {
    "id": "pref-guid",
    "sistemaId": "00000000-0000-0000-0000-000000000001",
    "tipoNotificacao": "vencimento",
    "habilitada": true,
    "criadoEm": "2025-01-23T10:30:00Z"
  }
]
```

---

#### PUT `/api/preferencias/{id}`

Atualiza preferência (habilita/desabilita).

**Autenticação:** JWT

**Request Body:**
```json
true  // ou false
```

**Response 200:**
```json
{
  "id": "pref-guid",
  "habilitada": true
}
```

---

#### DELETE `/api/preferencias/{id}`

Remove preferência.

**Autenticação:** JWT

**Response 204:** No Content

---

### 📌 Endpoints de Subscrições

#### POST `/api/subscricoes`

Cria subscrição para seguir uma entidade.

**Autenticação:** JWT

**Request Body:**
```json
{
  "usuarioId": "user-guid",  // Será sobrescrito pelo usuário do token
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "entidadeOrigemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response 201:**
```json
{
  "id": "sub-guid",
  "usuarioId": "user-guid",
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "entidadeOrigemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ativa": true,
  "criadoEm": "2025-01-23T10:30:00Z"
}
```

**Uso em TypeScript:**
```typescript
async function seguirEntidade(sistemaId: string, entidadeOrigemId: string) {
  const response = await api.post('/subscricoes', {
    sistemaId,
    entidadeOrigemId
  });
  return response.data;
}
```

---

#### GET `/api/subscricoes/minhas`

Lista subscrições do usuário.

**Autenticação:** JWT

**Query Params:**
- `page` (opcional, padrão: 1)
- `pageSize` (opcional, padrão: 20)
- `sistemaId` (opcional) - Filtrar por sistema

**Response 200:**
```json
{
  "items": [
    {
      "id": "sub-guid",
      "sistemaId": "00000000-0000-0000-0000-000000000001",
      "entidadeOrigemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "ativa": true,
      "criadoEm": "2025-01-23T10:30:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 5
}
```

---

#### GET `/api/subscricoes/entidade/{sistemaId}/{entidadeOrigemId}`

Lista usuários seguindo uma entidade.

**Autenticação:** JWT

**Path Params:**
- `sistemaId` - ID do sistema
- `entidadeOrigemId` - ID da entidade

**Response 200:**
```json
[
  {
    "id": "sub-guid",
    "usuarioId": "user-guid",
    "criadoEm": "2025-01-23T10:30:00Z"
  }
]
```

---

#### DELETE `/api/subscricoes/{id}`

Remove subscrição (deixa de seguir).

**Autenticação:** JWT

**Response 204:** No Content

---

#### POST `/api/subscricoes/seguir`

Toggle: seguir ou deixar de seguir.

**Autenticação:** JWT

**Request Body:**
```json
{
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "entidadeOrigemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response 200:**
```json
{
  "seguindo": true,
  "mensagem": "Você está seguindo esta entidade",
  "subscricaoId": "sub-guid"
}
```

**Uso em TypeScript:**
```typescript
async function toggleSeguir(sistemaId: string, entidadeOrigemId: string) {
  const response = await api.post<{
    seguindo: boolean;
    mensagem: string;
    subscricaoId?: string;
  }>('/subscricoes/seguir', { sistemaId, entidadeOrigemId });

  return response.data;
}
```

---

#### GET `/api/subscricoes/estou-seguindo`

Verifica se está seguindo uma entidade.

**Autenticação:** JWT

**Query Params:**
- `sistemaId` - ID do sistema
- `entidadeOrigemId` - ID da entidade

**Response 200 (seguindo):**
```json
{
  "seguindo": true,
  "subscricaoId": "sub-guid",
  "criadoEm": "2025-01-23T10:30:00Z"
}
```

**Response 200 (não seguindo):**
```json
{
  "seguindo": false
}
```

**Uso em TypeScript:**
```typescript
async function estouSeguindo(sistemaId: string, entidadeOrigemId: string) {
  const response = await api.get<{
    seguindo: boolean;
    subscricaoId?: string;
    criadoEm?: string;
  }>('/subscricoes/estou-seguindo', {
    params: { sistemaId, entidadeOrigemId }
  });

  return response.data;
}
```

---

### 🔑 Endpoints de Administração de API Keys

**⚠️ IMPORTANTE:** Estes endpoints requerem autenticação JWT de administrador.

#### GET `/api/admin/apikeys`

Lista todas as API Keys cadastradas.

**Autenticação:** JWT (Admin)

**Response 200:**
```json
[
  {
    "id": "key-guid",
    "nome": "sistema-contratos",
    "sistemaId": "00000000-0000-0000-0000-000000000001",
    "ativa": true,
    "criadoEm": "2025-01-15T10:00:00Z",
    "expiraEm": "2026-12-31T23:59:59Z",
    "ultimoUso": "2025-01-23T10:30:00Z",
    "keyHashParcial": "a1b2c3d4..."
  }
]
```

---

#### POST `/api/admin/apikeys`

Cria nova API Key para microserviço.

**Autenticação:** JWT (Admin)

**Request Body:**
```json
{
  "nome": "sistema-contratos",
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "expiraEm": "2026-12-31T23:59:59Z"
}
```

**Response 200:**
```json
{
  "id": "key-guid",
  "nome": "sistema-contratos",
  "sistemaId": "00000000-0000-0000-0000-000000000001",
  "chave": "xK9vP2mR7wQ4hJ3bN6tY8uI5oL1sD0fG==",
  "formato": "Authorization: ApiKey sistema-contratos:xK9vP2mR7wQ4hJ3bN6tY8uI5oL1sD0fG==",
  "aviso": "⚠️ ATENÇÃO: Salve esta chave! Ela não será exibida novamente.",
  "expiraEm": "2026-12-31T23:59:59Z",
  "criadoEm": "2025-01-23T10:30:00Z"
}
```

**⚠️ A chave em texto plano é retornada APENAS UMA VEZ.**

---

#### DELETE `/api/admin/apikeys/{id}`

Desativa API Key.

**Autenticação:** JWT (Admin)

**Response 200:**
```json
{
  "message": "API Key 'sistema-contratos' desativada com sucesso"
}
```

---

#### PUT `/api/admin/apikeys/{id}/reativar`

Reativa API Key previamente desativada.

**Autenticação:** JWT (Admin)

**Response 200:**
```json
{
  "message": "API Key 'sistema-contratos' reativada com sucesso"
}
```

---

### 🔧 Endpoints de Debug

**⚠️ IMPORTANTE:** Estes endpoints são para desenvolvimento e debug. Devem ser desabilitados em produção.

#### GET `/api/debug/api-keys`

Lista todas as API Keys cadastradas no sistema com informações de status.

**Autenticação:** Nenhuma (em dev)

**Response 200:**
```json
[
  {
    "id": "2071c491-11d8-4fe1-86ed-8d4c147f852e",
    "nome": "teste-key",
    "sistemaId": "7b8659bb-1aeb-4d74-92c1-110c1d27e576",
    "ativa": true,
    "expiraEm": "2025-10-23T20:10:39.683Z",
    "expirada": true,
    "hashParcial": "c89518f28c1a4a0e...",
    "criadoEm": "2025-10-23T20:10:39.894958Z",
    "ultimoUso": null
  }
]
```

---

#### POST `/api/debug/test-api-key`

Testa a validação de uma API Key específica, retornando detalhes sobre por que está falhando.

**Autenticação:** Nenhuma (em dev)

**Request Body:**
```json
{
  "nome": "teste-key",
  "chave": "5/6gKCMx/Iab9cCVq1lbdBImeVNb0wzbOTfJa6PfuBQ="
}
```

**Response 200 (chave válida):**
```json
{
  "encontrada": true,
  "ativa": true,
  "expiraEm": "2026-12-31T23:59:59Z",
  "expirada": false,
  "hashCorresponde": true,
  "hashEnviado": "c89518f28c1a4a0e...",
  "hashBanco": "c89518f28c1a4a0e...",
  "sistemaId": "7b8659bb-1aeb-4d74-92c1-110c1d27e576",
  "validacaoFinal": true,
  "detalhes": {
    "motivoFalha": null
  }
}
```

**Response 200 (chave inválida):**
```json
{
  "encontrada": true,
  "ativa": true,
  "expiraEm": "2025-10-23T20:10:39.683Z",
  "expirada": true,
  "hashCorresponde": true,
  "hashEnviado": "c89518f28c1a4a0e...",
  "hashBanco": "c89518f28c1a4a0e...",
  "sistemaId": "7b8659bb-1aeb-4d74-92c1-110c1d27e576",
  "validacaoFinal": false,
  "detalhes": {
    "motivoFalha": "API Key expirada"
  }
}
```

**Possíveis motivos de falha:**
- `"Hash não corresponde"` - Chave incorreta
- `"API Key inativa"` - Foi desativada
- `"API Key expirada"` - Passou da data de expiração
- `"API Key não encontrada"` - Nome não existe

**Exemplo de uso em TypeScript:**
```typescript
async function debugApiKey(nome: string, chave: string) {
  const response = await axios.post('/api/debug/test-api-key', {
    nome,
    chave
  });

  const { validacaoFinal, detalhes } = response.data;

  if (!validacaoFinal) {
    console.error(`❌ API Key inválida: ${detalhes.motivoFalha}`);
  } else {
    console.log('✅ API Key válida');
  }

  return response.data;
}
```

---

#### GET `/api/debug/jwt-config`

Retorna configuração JWT do servidor (útil para debug de autenticação).

**Autenticação:** Nenhuma (em dev)

**Response 200:**
```json
{
  "issuer": "egestao-micro-auth-api",
  "audiences": ["egestao-frontend"],
  "audiencesCount": 1,
  "keyLength": 64,
  "keyFirst10": "PLACEHOLDE..."
}
```

---

#### GET `/api/debug/test-auth`

Testa a validade do token JWT enviado e retorna os claims.

**Autenticação:** JWT

**Response 200:**
```json
{
  "authenticated": true,
  "identity": null,
  "claims": [
    {
      "type": "sub",
      "value": "usuario@example.com"
    },
    {
      "type": "usuarioId",
      "value": "01981234-5678-9abc-def0-123456789abc"
    },
    {
      "type": "nomeCompleto",
      "value": "João Silva"
    }
  ]
}
```

**Exemplo de uso:**
```typescript
async function debugJwt(token: string) {
  try {
    const response = await axios.get('/api/debug/test-auth', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.authenticated) {
      console.log('✅ Token JWT válido');
      console.log('Claims:', response.data.claims);
    } else {
      console.error('❌ Token JWT inválido');
    }
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
  }
}
```

---

## SignalR - Notificações em Tempo Real

### 1. Criar Conexão SignalR

```typescript
import * as signalR from '@microsoft/signalr';

class NotificacaoService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(private baseUrl: string) {}

  /**
   * Conecta ao SignalR Hub
   */
  async conectar(jwtToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('Já conectado ao SignalR');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/api/notificacaohub`, {
        accessTokenFactory: () => jwtToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Backoff exponencial: 0s, 2s, 10s, 30s, então sempre 30s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Registrar listeners para eventos
    this.setupEventListeners();

    try {
      await this.connection.start();
      console.log('✅ Conectado ao SignalR Hub');
    } catch (error) {
      console.error('❌ Erro ao conectar ao SignalR:', error);
      throw error;
    }
  }

  /**
   * Desconecta do SignalR Hub
   */
  async desconectar(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log('Desconectado do SignalR Hub');
    }
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    if (!this.connection) return;

    // Evento: Nova notificação recebida (persistente)
    this.connection.on('ReceiveNotificacao', (notificacao: Notificacao) => {
      console.log('📬 Nova notificação recebida:', notificacao);
      this.trigger('nova-notificacao', notificacao);
    });

    // Evento: Broadcast recebido (temporário, alerta global)
    this.connection.on('ReceiveBroadcast', (broadcast: Broadcast) => {
      console.log('📢 Broadcast recebido:', broadcast);
      this.trigger('broadcast', broadcast);
    });

    // Evento: Conectado ao Hub
    this.connection.on('Connected', (data) => {
      console.log('✅ Conectado:', data);
    });

    // Evento: Entrou no grupo do sistema
    this.connection.on('JoinedSistema', (data) => {
      console.log('📢 Entrou no grupo:', data);
    });

    // Evento: Saiu do grupo do sistema
    this.connection.on('LeftSistema', (data) => {
      console.log('📢 Saiu do grupo:', data);
    });

    // Evento: Erro
    this.connection.on('Error', (error) => {
      console.error('❌ Erro SignalR:', error);
      this.trigger('erro', error);
    });

    // Evento: Reconexão bem-sucedida
    this.connection.onreconnected((connectionId) => {
      console.log('🔄 Reconectado ao SignalR. ConnectionId:', connectionId);
      this.trigger('reconectado', connectionId);
    });

    // Evento: Tentando reconectar
    this.connection.onreconnecting((error) => {
      console.log('🔄 Tentando reconectar...', error);
      this.trigger('reconectando', error);
    });

    // Evento: Conexão fechada
    this.connection.onclose((error) => {
      console.log('❌ Conexão fechada', error);
      this.trigger('desconectado', error);
    });
  }

  /**
   * Entra no grupo de broadcast de um sistema
   */
  async joinSistema(sistemaId: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Não conectado ao SignalR');
    }

    try {
      await this.connection.invoke('JoinSistema', sistemaId);
      console.log(`📢 Inscrito para broadcasts do sistema: ${sistemaId}`);
    } catch (error) {
      console.error('❌ Erro ao entrar no grupo do sistema:', error);
      throw error;
    }
  }

  /**
   * Sai do grupo de broadcast de um sistema
   */
  async leaveSistema(sistemaId: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Não conectado ao SignalR');
    }

    try {
      await this.connection.invoke('LeaveSistema', sistemaId);
      console.log(`📢 Desinscrito dos broadcasts do sistema: ${sistemaId}`);
    } catch (error) {
      console.error('❌ Erro ao sair do grupo do sistema:', error);
      throw error;
    }
  }

  /**
   * Adiciona um listener para um evento
   */
  on(evento: string, callback: Function): void {
    if (!this.listeners.has(evento)) {
      this.listeners.set(evento, []);
    }
    this.listeners.get(evento)!.push(callback);
  }

  /**
   * Remove um listener
   */
  off(evento: string, callback: Function): void {
    const callbacks = this.listeners.get(evento);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Dispara um evento
   */
  private trigger(evento: string, ...args: any[]): void {
    const callbacks = this.listeners.get(evento);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  /**
   * Verifica se está conectado
   */
  get estaConectado(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Tipos TypeScript
interface Notificacao {
  id: string;
  sistemaId: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  lida: boolean;
  lidaEm?: string;
  arquivada: boolean;
  arquivadaEm?: string;
  criadoEm: string;
  metadados?: Record<string, any>;
}

interface Broadcast {
  sistemaId: string;
  titulo: string;
  mensagem: string;
  prioridade: 0 | 1 | 2; // Info = 0, Normal = 1, Urgente = 2
  categoria?: string;
  urlAcao?: string;
  criadoEm: string;
  usuariosConectados: number;
  info: string;
}
```

### 2. Uso em React Hook

```typescript
import { useEffect, useRef, useState } from 'react';

export function useNotificacoes(sistemaId?: string) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [conectado, setConectado] = useState(false);
  const serviceRef = useRef<NotificacaoService | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.warn('Token JWT não encontrado');
      return;
    }

    // Criar serviço
    const service = new NotificacaoService('https://notificacoes.egestao.com');
    serviceRef.current = service;

    // Registrar listeners - Notificações persistentes
    service.on('nova-notificacao', (notificacao: Notificacao) => {
      setNotificacoes(prev => [notificacao, ...prev]);

      // Mostrar notificação do navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificacao.titulo, {
          body: notificacao.mensagem,
          icon: '/logo.png',
          tag: notificacao.id
        });
      }
    });

    // Registrar listener - Broadcasts (alertas globais temporários)
    service.on('broadcast', (broadcast: Broadcast) => {
      console.log('📢 Broadcast recebido:', broadcast);

      // Mostrar toast/alerta proeminente
      if (broadcast.prioridade === 2) {
        // Urgente - modal ou alerta que não fecha automaticamente
        alert(`🚨 ${broadcast.titulo}\n\n${broadcast.mensagem}`);
      } else {
        // Normal - toast temporário
        showToast(broadcast.titulo, broadcast.mensagem, {
          duration: 8000,
          type: broadcast.prioridade === 1 ? 'warning' : 'info'
        });
      }
    });

    service.on('reconectado', () => {
      setConectado(true);

      // Reentrar no grupo do sistema após reconexão
      if (sistemaId) {
        service.joinSistema(sistemaId).catch(console.error);
      }

      // Recarregar notificações após reconexão
      carregarNotificacoes();
    });

    service.on('reconectando', () => setConectado(false));
    service.on('desconectado', () => setConectado(false));

    // Conectar
    service.conectar(token)
      .then(async () => {
        setConectado(true);

        // Entrar no grupo do sistema para receber broadcasts
        if (sistemaId) {
          await service.joinSistema(sistemaId);
        }

        carregarNotificacoes();
      })
      .catch(err => console.error('Erro ao conectar:', err));

    // Cleanup
    return () => {
      if (sistemaId && service) {
        service.leaveSistema(sistemaId).catch(console.error);
      }
      service.desconectar();
    };
  }, [sistemaId]);

  const carregarNotificacoes = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.get('https://notificacoes.egestao.com/api/notificacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  return { notificacoes, conectado, service: serviceRef.current };
}
```

---

## REST API - Operações CRUD

### Configuração do Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://notificacoes.egestao.com/api',
  timeout: 10000
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Endpoints Disponíveis

#### 1. Listar Notificações do Usuário

```typescript
/**
 * Lista todas as notificações do usuário autenticado
 */
async function listarNotificacoes(): Promise<Notificacao[]> {
  const response = await api.get<Notificacao[]>('/notificacoes');
  return response.data;
}

// Com filtros
async function listarNotificacoesComFiltros(params: {
  lida?: boolean;
  arquivada?: boolean;
  tipo?: string;
  limit?: number;
}): Promise<Notificacao[]> {
  const response = await api.get<Notificacao[]>('/notificacoes', { params });
  return response.data;
}

// Exemplo de uso:
const naoLidas = await listarNotificacoesComFiltros({ lida: false });
const avisos = await listarNotificacoesComFiltros({ tipo: 'warning' });
```

#### 2. Obter Notificação por ID

```typescript
async function obterNotificacao(id: string): Promise<Notificacao> {
  const response = await api.get<Notificacao>(`/notificacoes/${id}`);
  return response.data;
}
```

#### 3. Marcar como Lida

```typescript
async function marcarComoLida(id: string): Promise<void> {
  await api.patch(`/notificacoes/${id}/marcar-lida`);
}
```

#### 4. Marcar como Não Lida

```typescript
async function marcarComoNaoLida(id: string): Promise<void> {
  await api.patch(`/notificacoes/${id}/marcar-nao-lida`);
}
```

#### 5. Arquivar Notificação

```typescript
async function arquivar(id: string): Promise<void> {
  await api.patch(`/notificacoes/${id}/arquivar`);
}
```

#### 6. Desarquivar Notificação

```typescript
async function desarquivar(id: string): Promise<void> {
  await api.patch(`/notificacoes/${id}/desarquivar`);
}
```

#### 7. Marcar Todas como Lidas

```typescript
async function marcarTodasComoLidas(): Promise<void> {
  await api.post('/notificacoes/marcar-todas-lidas');
}
```

#### 8. Deletar Notificação

```typescript
async function deletarNotificacao(id: string): Promise<void> {
  await api.delete(`/notificacoes/${id}`);
}
```

---

## Gerenciamento de Subscrições

As subscrições permitem que usuários "sigam" entidades específicas (contratos, processos, documentos, etc.) e recebam notificações em tempo real sobre elas.

### 1. Seguir uma Entidade

```typescript
async function seguirEntidade(sistemaId: string, entidadeOrigemId: string) {
  const response = await api.post('/subscricoes', {
    sistemaId,
    entidadeOrigemId
  });
  return response.data;
}

// Exemplo de uso:
await seguirEntidade(
  '00000000-0000-0000-0000-000000000001',  // ID do sistema
  '3fa85f64-5717-4562-b3fc-2c963f66afa6'   // ID do contrato/processo
);
```

### 2. Implementar Botão "Seguir/Deixar de Seguir"

```tsx
import React, { useState, useEffect } from 'react';
import api from './services/api';

interface SeguirButtonProps {
  sistemaId: string;
  entidadeOrigemId: string;
}

export function SeguirButton({ sistemaId, entidadeOrigemId }: SeguirButtonProps) {
  const [seguindo, setSeguindo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarStatus();
  }, [sistemaId, entidadeOrigemId]);

  const verificarStatus = async () => {
    try {
      const response = await api.get('/subscricoes/estou-seguindo', {
        params: { sistemaId, entidadeOrigemId }
      });
      setSeguindo(response.data.seguindo);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      const response = await api.post('/subscricoes/seguir', {
        sistemaId,
        entidadeOrigemId
      });
      setSeguindo(response.data.seguindo);

      // Notificar usuário
      if (response.data.seguindo) {
        alert('✅ Você está seguindo esta entidade');
      } else {
        alert('❌ Você deixou de seguir esta entidade');
      }
    } catch (error) {
      console.error('Erro ao alternar seguimento:', error);
      alert('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <button disabled>Carregando...</button>;
  }

  return (
    <button onClick={handleToggle} className={seguindo ? 'following' : 'not-following'}>
      {seguindo ? '🔔 Seguindo' : '🔕 Seguir'}
    </button>
  );
}
```

### 3. Listar Entidades que o Usuário Está Seguindo

```typescript
async function listarMinhasSubscricoes(
  page = 1,
  pageSize = 20,
  sistemaId?: string
) {
  const params: any = { page, pageSize };
  if (sistemaId) params.sistemaId = sistemaId;

  const response = await api.get('/subscricoes/minhas', { params });
  return response.data;
}

// Exemplo de uso:
const minhasSubscricoes = await listarMinhasSubscricoes(1, 20);

// Filtrar apenas subscrições de um sistema específico:
const subscricoesContratos = await listarMinhasSubscricoes(
  1,
  20,
  '00000000-0000-0000-0000-000000000001'
);
```

### 4. Ver Quantos Usuários Estão Seguindo uma Entidade

```typescript
async function listarSeguidores(sistemaId: string, entidadeOrigemId: string) {
  const response = await api.get(
    `/subscricoes/entidade/${sistemaId}/${entidadeOrigemId}`
  );
  return response.data;
}

// Exemplo de uso:
const seguidores = await listarSeguidores(
  '00000000-0000-0000-0000-000000000001',
  '3fa85f64-5717-4562-b3fc-2c963f66afa6'
);

console.log(`${seguidores.length} usuários estão seguindo esta entidade`);
```

### 5. Deixar de Seguir uma Entidade

```typescript
async function deixarDeSeguir(subscricaoId: string) {
  await api.delete(`/subscricoes/${subscricaoId}`);
}

// Exemplo de uso:
await deixarDeSeguir('sub-guid-aqui');
```

### 6. Componente Completo - Lista de Subscrições

```tsx
import React, { useState, useEffect } from 'react';
import api from './services/api';

interface Subscricao {
  id: string;
  sistemaId: string;
  entidadeOrigemId: string;
  ativa: boolean;
  criadoEm: string;
}

export function MinhasSubscricoes() {
  const [subscricoes, setSubscricoes] = useState<Subscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    carregarSubscricoes();
  }, [page]);

  const carregarSubscricoes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscricoes/minhas', {
        params: { page, pageSize: 20 }
      });
      setSubscricoes(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Erro ao carregar subscrições:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async (id: string) => {
    if (!confirm('Deseja deixar de seguir esta entidade?')) return;

    try {
      await api.delete(`/subscricoes/${id}`);
      setSubscricoes(prev => prev.filter(s => s.id !== id));
      alert('✅ Você deixou de seguir esta entidade');
    } catch (error) {
      console.error('Erro ao remover subscrição:', error);
      alert('Erro ao processar solicitação');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="minhas-subscricoes">
      <h2>Entidades que Estou Seguindo ({total})</h2>

      {subscricoes.length === 0 ? (
        <p>Você não está seguindo nenhuma entidade ainda.</p>
      ) : (
        <ul>
          {subscricoes.map(sub => (
            <li key={sub.id} className="subscricao-item">
              <div className="info">
                <strong>Entidade:</strong> {sub.entidadeOrigemId}
                <br />
                <small>Sistema: {sub.sistemaId}</small>
                <br />
                <small>Seguindo desde: {new Date(sub.criadoEm).toLocaleDateString('pt-BR')}</small>
              </div>
              <button onClick={() => handleRemover(sub.id)}>
                🗑️ Deixar de Seguir
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Paginação */}
      <div className="paginacao">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          ← Anterior
        </button>
        <span>Página {page}</span>
        <button
          disabled={subscricoes.length < 20}
          onClick={() => setPage(p => p + 1)}
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
```

---

## Gerenciamento de Preferências

### 1. Obter Preferências

```typescript
interface Preferencia {
  id: string;
  usuarioId: string;
  receberNotificacoes: boolean;
  receberPorEmail: boolean;
  receberPorSms: boolean;
  notificarInfo: boolean;
  notificarSuccess: boolean;
  notificarWarning: boolean;
  notificarError: boolean;
  horarioInicioSilencioso?: string;  // "22:00:00"
  horarioFimSilencioso?: string;     // "07:00:00"
}

async function obterPreferencias(): Promise<Preferencia> {
  const response = await api.get<Preferencia>('/preferencias');
  return response.data;
}
```

### 2. Atualizar Preferências

```typescript
async function atualizarPreferencias(preferencias: Partial<Preferencia>): Promise<Preferencia> {
  const response = await api.put<Preferencia>('/preferencias', preferencias);
  return response.data;
}

// Exemplo de uso:
await atualizarPreferencias({
  receberNotificacoes: true,
  notificarError: true,
  notificarWarning: true,
  horarioInicioSilencioso: '22:00:00',
  horarioFimSilencioso: '07:00:00'
});
```

---

## Exemplos Completos

### Componente React - Listagem de Notificações

```tsx
import React, { useState } from 'react';
import { useNotificacoes } from './hooks/useNotificacoes';
import api from './services/api';

export function NotificacoesPanel() {
  const { notificacoes, conectado } = useNotificacoes();
  const [filtro, setFiltro] = useState<'todas' | 'nao-lidas' | 'arquivadas'>('todas');

  const notificacoesFiltradas = React.useMemo(() => {
    switch (filtro) {
      case 'nao-lidas':
        return notificacoes.filter(n => !n.lida && !n.arquivada);
      case 'arquivadas':
        return notificacoes.filter(n => n.arquivada);
      default:
        return notificacoes.filter(n => !n.arquivada);
    }
  }, [notificacoes, filtro]);

  const handleMarcarLida = async (id: string) => {
    try {
      await api.patch(`/notificacoes/${id}/marcar-lida`);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleArquivar = async (id: string) => {
    try {
      await api.patch(`/notificacoes/${id}/arquivar`);
    } catch (error) {
      console.error('Erro ao arquivar:', error);
    }
  };

  const handleMarcarTodasLidas = async () => {
    try {
      await api.post('/notificacoes/marcar-todas-lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return (
    <div className="notificacoes-panel">
      <div className="header">
        <h2>Notificações</h2>
        <span className={`status ${conectado ? 'online' : 'offline'}`}>
          {conectado ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className="filtros">
        <button onClick={() => setFiltro('todas')} className={filtro === 'todas' ? 'active' : ''}>
          Todas
        </button>
        <button onClick={() => setFiltro('nao-lidas')} className={filtro === 'nao-lidas' ? 'active' : ''}>
          Não Lidas ({notificacoes.filter(n => !n.lida && !n.arquivada).length})
        </button>
        <button onClick={() => setFiltro('arquivadas')} className={filtro === 'arquivadas' ? 'active' : ''}>
          Arquivadas
        </button>
        <button onClick={handleMarcarTodasLidas} className="action-btn">
          Marcar Todas como Lidas
        </button>
      </div>

      <div className="notificacoes-lista">
        {notificacoesFiltradas.length === 0 ? (
          <p className="vazio">Nenhuma notificação</p>
        ) : (
          notificacoesFiltradas.map(notif => (
            <div
              key={notif.id}
              className={`notificacao ${notif.tipo} ${notif.lida ? 'lida' : 'nao-lida'}`}
            >
              <div className="icone">{getIcone(notif.tipo)}</div>
              <div className="conteudo">
                <h4>{notif.titulo}</h4>
                <p>{notif.mensagem}</p>
                <small>{new Date(notif.criadoEm).toLocaleString('pt-BR')}</small>
              </div>
              <div className="acoes">
                {!notif.lida && (
                  <button onClick={() => handleMarcarLida(notif.id)} title="Marcar como lida">
                    ✓
                  </button>
                )}
                {!notif.arquivada ? (
                  <button onClick={() => handleArquivar(notif.id)} title="Arquivar">
                    📥
                  </button>
                ) : (
                  <button onClick={() => api.patch(`/notificacoes/${notif.id}/desarquivar`)} title="Desarquivar">
                    📤
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getIcone(tipo: string): string {
  switch (tipo) {
    case 'info': return 'ℹ️';
    case 'success': return '✅';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    default: return '📬';
  }
}
```

### Componente React - Preferências

```tsx
import React, { useEffect, useState } from 'react';
import api from './services/api';

export function PreferenciasNotificacoes() {
  const [preferencias, setPreferencias] = useState<Preferencia | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPreferencias();
  }, []);

  const carregarPreferencias = async () => {
    try {
      const response = await api.get<Preferencia>('/preferencias');
      setPreferencias(response.data);
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  const handleSalvar = async () => {
    if (!preferencias) return;

    setSalvando(true);
    try {
      await api.put('/preferencias', preferencias);
      alert('Preferências salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      alert('Erro ao salvar preferências');
    } finally {
      setSalvando(false);
    }
  };

  if (!preferencias) return <div>Carregando...</div>;

  return (
    <div className="preferencias-notificacoes">
      <h2>Preferências de Notificações</h2>

      <div className="secao">
        <h3>Canais de Notificação</h3>
        <label>
          <input
            type="checkbox"
            checked={preferencias.receberNotificacoes}
            onChange={e => setPreferencias({ ...preferencias, receberNotificacoes: e.target.checked })}
          />
          Receber notificações no sistema
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferencias.receberPorEmail}
            onChange={e => setPreferencias({ ...preferencias, receberPorEmail: e.target.checked })}
          />
          Receber por e-mail
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferencias.receberPorSms}
            onChange={e => setPreferencias({ ...preferencias, receberPorSms: e.target.checked })}
          />
          Receber por SMS
        </label>
      </div>

      <div className="secao">
        <h3>Tipos de Notificação</h3>
        <label>
          <input
            type="checkbox"
            checked={preferencias.notificarInfo}
            onChange={e => setPreferencias({ ...preferencias, notificarInfo: e.target.checked })}
          />
          ℹ️ Informações
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferencias.notificarSuccess}
            onChange={e => setPreferencias({ ...preferencias, notificarSuccess: e.target.checked })}
          />
          ✅ Sucesso
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferencias.notificarWarning}
            onChange={e => setPreferencias({ ...preferencias, notificarWarning: e.target.checked })}
          />
          ⚠️ Avisos
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferencias.notificarError}
            onChange={e => setPreferencias({ ...preferencias, notificarError: e.target.checked })}
          />
          ❌ Erros
        </label>
      </div>

      <div className="secao">
        <h3>Horário Silencioso</h3>
        <label>
          Início:
          <input
            type="time"
            value={preferencias.horarioInicioSilencioso || ''}
            onChange={e => setPreferencias({ ...preferencias, horarioInicioSilencioso: e.target.value })}
          />
        </label>
        <label>
          Fim:
          <input
            type="time"
            value={preferencias.horarioFimSilencioso || ''}
            onChange={e => setPreferencias({ ...preferencias, horarioFimSilencioso: e.target.value })}
          />
        </label>
      </div>

      <button onClick={handleSalvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar Preferências'}
      </button>
    </div>
  );
}
```

### Componente - Bell Icon com Badge

```tsx
import React from 'react';
import { useNotificacoes } from './hooks/useNotificacoes';

export function NotificationBell() {
  const { notificacoes } = useNotificacoes();
  const [mostrarPanel, setMostrarPanel] = useState(false);

  const naoLidas = notificacoes.filter(n => !n.lida && !n.arquivada).length;

  return (
    <div className="notification-bell">
      <button onClick={() => setMostrarPanel(!mostrarPanel)}>
        🔔
        {naoLidas > 0 && <span className="badge">{naoLidas}</span>}
      </button>

      {mostrarPanel && (
        <div className="notification-dropdown">
          <NotificacoesPanel />
        </div>
      )}
    </div>
  );
}
```

---

## Tratamento de Erros

### Erros Comuns e Soluções

| Código | Erro | Causa | Solução |
|--------|------|-------|---------|
| 401 | Unauthorized | Token JWT ausente ou inválido | Redirecionar para login |
| 403 | Forbidden | Token válido mas sem permissão | Mostrar mensagem de acesso negado |
| 404 | Not Found | Notificação não encontrada | Atualizar lista de notificações |
| 409 | Conflict | Operação conflitante | Atualizar dados e tentar novamente |
| 500 | Internal Server Error | Erro no servidor | Mostrar mensagem genérica e logar erro |

### Exemplo de Tratamento

```typescript
async function marcarComoLida(id: string): Promise<void> {
  try {
    await api.patch(`/notificacoes/${id}/marcar-lida`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 401:
          window.location.href = '/login';
          break;
        case 404:
          alert('Notificação não encontrada');
          // Recarregar lista
          break;
        case 500:
          console.error('Erro no servidor:', error);
          alert('Erro ao processar solicitação. Tente novamente.');
          break;
        default:
          alert('Erro desconhecido');
      }
    }
    throw error;
  }
}
```

---

## Boas Práticas

### 1. Gerenciamento de Estado

Use bibliotecas como Redux, Zustand ou Context API para gerenciar notificações globalmente:

```typescript
// Exemplo com Zustand
import create from 'zustand';

interface NotificacoesStore {
  notificacoes: Notificacao[];
  adicionarNotificacao: (notificacao: Notificacao) => void;
  marcarComoLida: (id: string) => void;
  removerNotificacao: (id: string) => void;
}

export const useNotificacoesStore = create<NotificacoesStore>((set) => ({
  notificacoes: [],
  adicionarNotificacao: (notificacao) =>
    set((state) => ({ notificacoes: [notificacao, ...state.notificacoes] })),
  marcarComoLida: (id) =>
    set((state) => ({
      notificacoes: state.notificacoes.map((n) =>
        n.id === id ? { ...n, lida: true } : n
      ),
    })),
  removerNotificacao: (id) =>
    set((state) => ({
      notificacoes: state.notificacoes.filter((n) => n.id !== id),
    })),
}));
```

### 2. Permissões de Notificação do Navegador

```typescript
async function solicitarPermissaoNotificacao(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Solicitar ao fazer login
useEffect(() => {
  solicitarPermissaoNotificacao();
}, []);
```

### 3. Persistência Local (Offline-first)

```typescript
// Sincronizar notificações com IndexedDB para acesso offline
import { openDB } from 'idb';

const db = await openDB('notificacoes-db', 1, {
  upgrade(db) {
    db.createObjectStore('notificacoes', { keyPath: 'id' });
  },
});

async function salvarNotificacoesLocal(notificacoes: Notificacao[]) {
  const tx = db.transaction('notificacoes', 'readwrite');
  await Promise.all(notificacoes.map(n => tx.store.put(n)));
}

async function carregarNotificacoesLocal(): Promise<Notificacao[]> {
  return await db.getAll('notificacoes');
}
```

### 4. Debounce em Operações

```typescript
import { debounce } from 'lodash';

// Evitar múltiplas chamadas simultâneas
const marcarComoLidaDebounced = debounce(async (id: string) => {
  await api.patch(`/notificacoes/${id}/marcar-lida`);
}, 300);
```

### 5. Logs Estruturados

```typescript
class Logger {
  static info(mensagem: string, dados?: any) {
    console.log(`[INFO] ${mensagem}`, dados);
    // Enviar para serviço de logging (Sentry, LogRocket, etc.)
  }

  static error(mensagem: string, erro: Error, dados?: any) {
    console.error(`[ERROR] ${mensagem}`, erro, dados);
    // Enviar para Sentry, etc.
  }
}

// Uso:
Logger.info('Nova notificação recebida', { notificacaoId: notificacao.id });
Logger.error('Erro ao marcar como lida', error, { notificacaoId: id });
```

---

## Resumo dos Endpoints

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | /api/notificacoes | JWT | Lista notificações do usuário |
| GET | /api/notificacoes/{id} | JWT | Obter notificação específica |
| PATCH | /api/notificacoes/{id}/marcar-lida | JWT | Marcar como lida |
| PATCH | /api/notificacoes/{id}/marcar-nao-lida | JWT | Marcar como não lida |
| PATCH | /api/notificacoes/{id}/arquivar | JWT | Arquivar notificação |
| PATCH | /api/notificacoes/{id}/desarquivar | JWT | Desarquivar notificação |
| POST | /api/notificacoes/marcar-todas-lidas | JWT | Marcar todas como lidas |
| DELETE | /api/notificacoes/{id} | JWT | Deletar notificação |
| GET | /api/preferencias | JWT | Obter preferências |
| PUT | /api/preferencias | JWT | Atualizar preferências |
| WS | /api/notificacaohub | JWT (query) | SignalR Hub |

---

## Suporte

Para dúvidas ou problemas:
- Consulte o Swagger em `https://notificacoes.egestao.com/swagger`
- Verifique os logs do console do navegador
- Entre em contato com a equipe de desenvolvimento

---

## Changelog

- **v1.0** - Versão inicial com SignalR e REST API
- Arquivamento de notificações
- Preferências de notificação
- Autenticação JWT
- API Keys para microserviços
