import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  AlertTriangle,
  FileText,
  Users,
  CheckCircle2,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/auth/auth-store'
import { createServiceLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import {
  useContractChatMessages,
  useSendChatMessage,
  useContractChatRealtime,
} from '@/modules/Contratos/hooks/use-chat'
import {
  CHAT_PAGE_SIZE_DEFAULT,
  CHAT_SISTEMA_ID,
} from '@/modules/Contratos/types/chat-api'
import type { ChatParticipante } from '@/modules/Contratos/types/timeline'

const logger = createServiceLogger('contract-chat')

interface ContractChatProps {
  contratoId: string
  numeroContrato: string
  className?: string
}

export const ContractChat = ({
  contratoId,
  numeroContrato,
  className,
}: ContractChatProps) => {
  const [novaMensagem, setNovaMensagem] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const previousMessageCountRef = useRef(0)

  const { usuario } = useAuthStore()

  const currentUserId = usuario?.id ?? 'usuario-anonimo'
  const currentUserNome = usuario?.nomeCompleto ?? 'Você'
  const pageSize = CHAT_PAGE_SIZE_DEFAULT

  const {
    mensagens,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useContractChatMessages(contratoId, {
    enabled: Boolean(contratoId),
    pageSize,
    sistemaId: CHAT_SISTEMA_ID,
  })

  const sendMessageMutation = useSendChatMessage(contratoId)

  const realtime = useContractChatRealtime({
    contratoId,
    autorId: currentUserId,
    sistemaId: CHAT_SISTEMA_ID,
    pageSize,
  })

  const mensagensOrdenadas = useMemo(() => {
    return [...mensagens].sort(
      (a, b) => new Date(a.dataEnvio).getTime() - new Date(b.dataEnvio).getTime(),
    )
  }, [mensagens])

  const participantes = useMemo<ChatParticipante[]>(() => {
    const map = new Map<string, ChatParticipante>()

    mensagens.forEach((mensagem) => {
      const { id, nome, tipo, avatar } = mensagem.remetente
      const nomeNormalizado = nome ?? 'Usuário'

      if (!map.has(id)) {
        map.set(id, {
          id,
          nome: nomeNormalizado,
          email: '',
          avatar,
          tipo: tipo === 'sistema' ? 'usuario' : (tipo ?? 'usuario'),
          status: 'online',
          ultimoAcesso: mensagem.dataEnvio,
        })
      }
    })

    if (!map.has(currentUserId)) {
      map.set(currentUserId, {
        id: currentUserId,
        nome: currentUserNome,
        email: usuario?.email ?? '',
        tipo: 'usuario',
        status: 'online',
      })
    }

    return Array.from(map.values())
  }, [mensagens, currentUserId, currentUserNome, usuario])

  const currentUserParticipant = useMemo(
    () => participantes.find((p) => p.id === currentUserId),
    [participantes, currentUserId],
  )

  // Auto-scroll para nova mensagem
  useEffect(() => {
    const mensagensCount = mensagensOrdenadas.length
    const previousCount = previousMessageCountRef.current
    previousMessageCountRef.current = mensagensCount

    if (mensagensCount <= previousCount) {
      return
    }

    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLDivElement | null

    if (viewport && typeof viewport.scrollTo === 'function') {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [mensagensOrdenadas])

  const handleEnviarMensagem = useCallback(() => {
    if (!novaMensagem.trim() || sendMessageMutation.isPending) return

    try {
      sendMessageMutation.mutate({
        conteudo: novaMensagem.trim(),
        autorId: currentUserId,
        autorNome: currentUserNome,
      })
      setNovaMensagem('')
      realtime.stopTyping()
    } catch (err) {
      logger.error('Erro ao enviar mensagem:', err as string)
    }
  }, [
    novaMensagem,
    sendMessageMutation,
    currentUserId,
    currentUserNome,
    realtime,
  ])


  const formatarHorario = (dataHora: string) => {
    return new Date(dataHora).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  const getTipoIcon = (tipo: string) => {
    const icons = {
      fiscal: <FileText className="h-3 w-3" />,
      gestor: <Users className="h-3 w-3" />,
      usuario: <MessageSquare className="h-3 w-3" />,
      sistema: <CheckCircle2 className="h-3 w-3" />,
    }

    if (Object.prototype.hasOwnProperty.call(icons, tipo)) {
      return icons[tipo as keyof typeof icons]
    }

    return <MessageSquare className="h-3 w-3" />
  }

  return (
    <Card className={cn('flex flex-col', className ?? 'h-full min-h-[700px]')}>
      {/* Header do Chat */}
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Observações do Contrato
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {numeroContrato} • Registre observações e acompanhamento
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {
                mensagensOrdenadas.filter((m) => m.tipo !== 'sistema').length
              }{' '}
              observações
            </Badge>
            <Badge
              variant="outline"
              className="hidden items-center gap-1 text-xs md:flex"
            >
              <Users className="h-3 w-3" />
              {participantes.length}
            </Badge>
            <Badge
              variant={
                realtime.isConnected
                  ? 'outline'
                  : realtime.connectionState === 'connecting'
                    ? 'secondary'
                    : 'destructive'
              }
              className="flex items-center gap-1 text-xs"
            >
              <Loader2
                className={cn(
                  'h-3 w-3',
                  realtime.isConnecting ? 'animate-spin' : 'hidden',
                )}
              />
              {realtime.connectionState === 'connected'
                ? 'Tempo real'
                : realtime.connectionState === 'connecting'
                  ? 'Conectando'
                  : 'Offline'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Mensagens */}
      <div className="to-muted/10 flex-1 overflow-hidden bg-gradient-to-b from-white">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-6 p-6">
            {isError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-medium">Erro ao carregar o chat</p>
                <p className="mt-1 opacity-80">
                  {error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar as mensagens. Tente novamente.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    void refetch()
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void fetchNextPage()
                  }}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Carregar mensagens anteriores'
                  )}
                </Button>
              </div>
            )}

            {realtime.connectionState === 'error' && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                Conexão em tempo real indisponível. Exibindo dados armazenados no
                cache.
              </div>
            )}

            {isLoading && mensagensOrdenadas.length === 0 && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`chat-skeleton-${index}`}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-muted h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-4 w-1/3 rounded" />
                      <div className="bg-muted h-14 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && mensagensOrdenadas.length === 0 && !isError && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhuma observação registrada para este contrato.
              </div>
            )}

            <AnimatePresence>
              {mensagensOrdenadas.map((mensagem) => {
                const remetenteTipo = mensagem.remetente.tipo ?? 'usuario'
                const remetenteNome = mensagem.remetente.nome ?? 'Usuário'
                const isOwn = mensagem.remetente.id === currentUserId

                return (
                  <motion.div
                    key={mensagem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex gap-3',
                      isOwn && 'flex-row-reverse',
                      mensagem.tipo === 'sistema' && 'justify-center',
                    )}
                  >
                    {mensagem.tipo === 'sistema' ? (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center">
                        <p className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700">
                          <CheckCircle2 className="h-4 w-4" />
                          {mensagem.conteudo}
                        </p>
                        <span className="mt-1 block text-xs text-blue-600/70">
                          {formatarHorario(mensagem.dataEnvio)}
                        </span>
                      </div>
                    ) : (
                      <>
                        {!isOwn && (
                          <div className="mt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                                {remetenteNome
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}

                        <div
                          className={cn(
                            'flex-1',
                            isOwn && 'flex flex-col items-end',
                          )}
                        >
                          {!isOwn && (
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-foreground text-sm font-medium">
                                {remetenteNome}
                              </span>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 px-2 py-0.5 text-xs"
                              >
                                {getTipoIcon(remetenteTipo)}
                                <span className="capitalize">{remetenteTipo}</span>
                              </Badge>
                            </div>
                          )}

                          <div className="group relative">
                            <div
                              className={cn(
                                'rounded-lg border px-4 py-3 text-sm leading-relaxed shadow-sm',
                                isOwn
                                  ? 'border-blue-500 bg-blue-500 text-white'
                                  : 'border-border bg-white transition-shadow hover:shadow-md',
                              )}
                            >
                              {mensagem.conteudo}
                            </div>

                            <div
                              className={cn(
                                'text-muted-foreground mt-1 text-xs',
                                isOwn && 'text-right',
                              )}
                            >
                              {formatarHorario(mensagem.dataEnvio)}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Input de nova observação */}
      <div className="bg-muted/20 border-t p-4">
        <div className="space-y-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Nova Observação</span>
          </div>

          <div className="flex gap-3">
            <Avatar className="mt-1 h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                {(currentUserParticipant?.nome
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2) ?? 'VC').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Registre uma observação sobre o contrato (ex: 'Verificar prazo de entrega', 'Fornecedor solicitou esclarecimento sobre item X')..."
                className="placeholder:text-muted-foreground/70 min-h-[80px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleEnviarMensagem()
                  }
                }}
                onFocus={() => {
                  realtime.startTyping()
                }}
                onBlur={() => {
                  realtime.stopTyping()
                }}
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  <kbd className="bg-muted rounded border px-1.5 py-0.5 text-xs">
                    Enter
                  </kbd>{' '}
                  para enviar •
                  <kbd className="bg-muted ml-1 rounded border px-1.5 py-0.5 text-xs">
                    Shift+Enter
                  </kbd>{' '}
                  nova linha
                </p>

                <Button
                  onClick={() => {
                    void handleEnviarMensagem()
                  }}
                  disabled={
                    !novaMensagem.trim() || sendMessageMutation.isPending
                  }
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Registrar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="flex items-start gap-2 text-xs text-blue-700">
            <FileText className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>
              <strong>Dica:</strong> Use este espaço para registrar observações
              importantes sobre o contrato.
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}
