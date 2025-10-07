# Plano de Integracao do Chat

## 1. Contexto e Objetivo

- Substituir mocks locais (arquivo: src/modules/Contratos/data/chat-mock.ts) pela integracao real com a EGestao Chat API.
- Reaproveitar infraestrutura existente (React 19, Vite, React Query, Axios com fallback, Zustand, Sonner) seguindo os guias em docs/FRONTEND_INTEGRATION.md e docs/IMPLEMENTATION_SUMMARY.md.
- Prover historico via REST (endpoints /api/Mensagens\*) e atualizacoes em tempo real via SignalR (/chathub), mantendo compatibilidade com o gancho onMarcarChatComoAlteracao e com a timeline de contratos.

## 2. Referencias da API (docs/api/chat.md)

- Autenticacao: cabecalho Authorization: Bearer <token>.
- POST /api/Mensagens (body CriarMensagemDto com campos sistemaId, entidadeOrigemId, texto, autorId, autorNome).
- GET /api/Mensagens com filtros SistemaId, EntidadeOrigemId, AutorId, AutorNome, Pesquisa, DataInicio, DataFim, Page, PageSize, SortDirection, SortBy, Offset.
- GET /api/Mensagens/{id} para recuperar mensagem unica.
- PUT /api/Mensagens/{id} (AtualizarMensagemDto) para edicao de texto.
- DELETE /api/Mensagens/{id} para exclusao.
- GET /api/Mensagens/sistema/{sistemaId}/entidade/{entidadeOrigemId} para carregar chat por contrato.
- GET /api/Mensagens/autor/{autorId}, GET /api/Mensagens/sistema/{sistemaId}, GET /api/Mensagens/periodo para consultas especificas.
- GET /api/Mensagens/estatisticas retornando EstatisticasDto com contagens e top autores.
- Health-checks: /api/Health, /api/Health/ready, /api/Health/live.
- Hub SignalR exposto em /chathub.

## 3. Dependencias e Configuracoes

- Adicionar pacote @microsoft/signalr ao front-end.
- Confirmar variaveis de ambiente: VITE_API_URL (gateway), VITE_API_URL_CONTRATOS (fallback atual) e, se necessario, VITE_API_URL_CHAT apontando direto para o servico de chat.
- Validar utilitarios ja existentes: src/lib/axios.ts (executeWithFallback, interceptores de token), src/lib/logger, notificacoes Sonner, modulo de autenticacao em src/lib/auth.
  SISTEMA ID DESSE APP = 7b8659bb-1aeb-4d74-92c1-110c1d27e576
- Mapear origem dos identificadores: sistemaId (identificador do modulo, confirmar com backend), entidadeOrigemId (contrato.id ou identificador equivalente), autorId e autorNome (usuario autenticado).

## 4. Modelos e Adaptadores

- Criar tipos dedicados (ex.: src/modules/Contratos/types/chat-api.ts) para refletir CriarMensagemDto, AtualizarMensagemDto, MensagemResponseDto, EstatisticasDto e ResultadoPaginado.
- Implementar adaptadores que convertam MensagemResponseDto em ChatMessage (enviadoEm -> dataEnvio, texto -> conteudo, autor -> remetente) e vice-versa.
- Definir constantes auxiliares (limite 250 caracteres, page size default, ordenacao desc por enviadoEm).

## 5. Servicos HTTP

- Criar src/modules/Contratos/services/chat-service.ts com funcoes :
  - fetchMensagens(params) -> GET /api/Mensagens (paginado).
  - fetchMensagensPorContrato(sistemaId, entidadeOrigemId) -> GET dedicado.
  - criarMensagem(payload) -> POST /api/Mensagens.
  - atualizarMensagem(id, payload) -> PUT /api/Mensagens/{id}.
  - removerMensagem(id) -> DELETE /api/Mensagens/{id}.
  - fetchEstatisticas() -> GET /api/Mensagens/estatisticas (quando necessario).
- Tratar respostas e erros (429/5xx) com logs e feedback para o usuario.
- Expor helpers para montagem de filtros (parse de datas, sanitizacao da string Pesquisa, traducao de ordenacao para API).

## 6. Estado e Hooks (React Query + Zustand)

- Implementar hook useContractChatMessages({ contratoId, pageSize }) com cache por contrato, paginacao e suporte a prefetch.
- Adicionar mutacoes useSendChatMessage, useUpdateChatMessage, useDeleteChatMessage com atualizacoes otimistas e invalidacao seletiva.
- Caso necessario, criar store leve em Zustand para estados em tempo real (usuarios conectados, digitando, mensagens pendentes) sincronizado com SignalR.

## 7. SignalR e Realtime

- Implementar singleton signalrManager em src/modules/Contratos/services/signalr-manager.ts com:
  - HubConnectionBuilder configurado com withUrl('/chathub', accessTokenFactory: getToken) e withAutomaticReconnect (0s, 2s, 10s, 30s).
  - Metodos initialize(), joinRoom({ sistemaId, entidadeOrigemId }), leaveRoom, sendMessage, startTyping, stopTyping.
  - Registro de eventos onMessageReceived, onTypingStarted, onTypingStopped, onUserConnected, onUserDisconnected, rejoinAllRooms em onreconnected.
- Criar hook useContractChatRealtime que consome signalrManager, une eventos em tempo real ao cache do React Query e evita duplicatas pelo id da mensagem.
- Definir fallback de UI quando SignalR estiver desconectado (banner informando offline e uso de polling se necessario).

## 8. Atualizacao dos Componentes de UI

- Refatorar ContractChat, chat-input e chat-message para carregar dados via novos hooks, assinar SignalR na montagem e desassinar na desmontagem.
- Remover importacoes de MENSAGENS_MOCK e PARTICIPANTES_MOCK e excluir src/modules/Contratos/data/chat-mock.ts ao final.
- Mostrar estados de carregamento, erro, offline e indicadores de digitacao/presenca conforme guide.
- Garantir que onMarcarChatComoAlteracao receba objetos reais e que contadores de mensagens nao lidas/estatisticas sejam atualizados.
- Ajustar layout se necessario para suportar paginacao (botao carregar mais ou infinite scroll) mantendo responsividade na aba de detalhes.

## 9. Testes e Observabilidade

- Escrever testes unitarios para adaptadores e servicos HTTP (mock de Axios e respostas paginadas).
- Criar testes de componente com React Testing Library validando envio otimista, exibicao de erros e integracao com timeline (mock de SignalR).
- Manter logs usando createServiceLogger('contract-chat') e registrar eventos de reconexao.
- Considerar feature flag para desabilitar SignalR em ambientes de teste automatizado.

## 10. Sequenciamento de Entrega

1. Aprovar plano.
2. Fase 1: tipos e adaptadores + testes.
3. Fase 2: servicos HTTP e hooks React Query.
4. Fase 3: signalrManager e hook realtime.
5. Fase 4: refactor de componentes e remocao de mocks.
6. Fase 5: testes finais, ajustes de UX e atualizacao de documentacao (README/CHANGELOG se aplicavel).
7. Fase 6: validacao manual, preparar commit seguindo convencional commits (ex.: feat(chat): integrar api realtime).

## 11. Pontos em Aberto

- Confirmar valores de sistemaId e entidadeOrigemId para contratos junto ao backend.
- Validar impacto do rate limiting (100 requisicoes por minuto) e definir estrategia de debounce/paginacao.
- Definir se endpoints especificos (por autor, periodo) entram nesta entrega ou ficam para iteracoes seguintes.
- Avaliar necessidade de endpoint de leitura para persistir estado lida (atualmente campo lida e somente local).
