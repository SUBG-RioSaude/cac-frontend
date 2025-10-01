import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bookmark,
  AlertTriangle,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { createServiceLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import {
  MENSAGENS_MOCK,
  PARTICIPANTES_MOCK,
} from '@/modules/Contratos/data/chat-mock'
import type {
  ChatMessage,
  ChatParticipante,
} from '@/modules/Contratos/types/timeline'

const logger = createServiceLogger('contract-chat')

interface ContractChatProps {
  contratoId: string
  numeroContrato: string
  onMarcarComoAlteracao?: (mensagem: ChatMessage) => void
  className?: string
}

export const ContractChat = ({
  contratoId,
  numeroContrato,
  onMarcarComoAlteracao,
  className,
}: ContractChatProps) => {
  const [mensagens, setMensagens] = useState<ChatMessage[]>(MENSAGENS_MOCK)
  const [participantes] = useState<ChatParticipante[]>(PARTICIPANTES_MOCK)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentUserId = '1' // Simular usuário logado

  // Auto-scroll para nova mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      if (scrollElement && typeof scrollElement.scrollTo === 'function') {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
  }, [mensagens])

  const handleEnviarMensagem = useCallback(() => {
    if (!novaMensagem.trim() || isLoading) return

    setIsLoading(true)

    try {
      const usuarioAtual = participantes.find((p) => p.id === currentUserId)
      const mensagemId = Date.now().toString()

      const mensagem: ChatMessage = {
        id: mensagemId,
        contratoId,
        remetente: {
          id: currentUserId,
          nome: usuarioAtual?.nome ?? 'Usuário',
          avatar: usuarioAtual?.avatar,
          tipo: usuarioAtual?.tipo ?? 'usuario',
        },
        conteudo: novaMensagem.trim(),
        tipo: 'texto',
        dataEnvio: new Date().toISOString(),
        lida: true,
      }

      setMensagens((prev) => [...prev, mensagem])
      setNovaMensagem('')
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsLoading(false)
    }
  }, [novaMensagem, isLoading, contratoId, participantes, currentUserId])

  const handleMarcarComoAlteracao = useCallback(
    (mensagem: ChatMessage) => {
      onMarcarComoAlteracao?.(mensagem)
    },
    [onMarcarComoAlteracao],
  )

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
    <Card className={cn('flex h-full min-h-[700px] flex-col', className)}>
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
              {mensagens.filter((m) => m.tipo !== 'sistema').length} observações
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Mensagens */}
      <div className="to-muted/10 flex-1 overflow-hidden bg-gradient-to-b from-white">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-6 p-6">
            <AnimatePresence>
              {mensagens.map((mensagem) => {
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
                      // Mensagem do sistema
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
                        {/* Avatar (sempre mostrar para identificação) */}
                        {!isOwn && (
                          <div className="mt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={mensagem.remetente.avatar}
                                alt={mensagem.remetente.nome}
                              />
                              <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                {mensagem.remetente.nome
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}

                        {/* Conteúdo da mensagem */}
                        <div
                          className={cn(
                            'flex-1',
                            isOwn && 'flex flex-col items-end',
                          )}
                        >
                          {!isOwn && (
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-foreground text-sm font-medium">
                                {mensagem.remetente.nome}
                              </span>
                              <Badge
                                variant="outline"
                                className="px-2 py-0.5 text-xs"
                              >
                                {getTipoIcon(mensagem.remetente.tipo)}
                                <span className="ml-1 capitalize">
                                  {mensagem.remetente.tipo}
                                </span>
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

                            {/* Botão para marcar como alteração */}
                            {!isOwn && onMarcarComoAlteracao && (
                              <div className="absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 border-orange-200 bg-white p-0 shadow-md hover:border-orange-300 hover:bg-orange-50"
                                  onClick={() =>
                                    handleMarcarComoAlteracao(mensagem)
                                  }
                                  title="Marcar como alteração contratual"
                                >
                                  <Bookmark className="h-3 w-3 text-orange-600" />
                                </Button>
                              </div>
                            )}

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
              <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                {participantes
                  .find((p) => p.id === currentUserId)
                  ?.nome.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
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
                  disabled={!novaMensagem.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Clock className="h-4 w-4 animate-spin" />
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
              importantes sobre o contrato. Passe o mouse sobre observações de
              outros usuários para marcá-las como alterações contratuais
              relevantes.
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}
