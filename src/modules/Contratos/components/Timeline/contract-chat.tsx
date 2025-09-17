import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
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

import type { ChatMessage, ChatParticipante } from '@/modules/Contratos/types/timeline'
import { MENSAGENS_MOCK, PARTICIPANTES_MOCK } from '@/modules/Contratos/data/chat-mock'

interface ContractChatProps {
  contratoId: string
  numeroContrato: string
  onMarcarComoAlteracao?: (mensagem: ChatMessage) => void
  className?: string
}

export function ContractChat({ 
  contratoId, 
  numeroContrato, 
  onMarcarComoAlteracao,
  className 
}: ContractChatProps) {
  const [mensagens, setMensagens] = useState<ChatMessage[]>(MENSAGENS_MOCK)
  const [participantes] = useState<ChatParticipante[]>(PARTICIPANTES_MOCK)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentUserId = '1' // Simular usuário logado
  
  // Auto-scroll para nova mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement && typeof scrollElement.scrollTo === 'function') {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [mensagens])

  const handleEnviarMensagem = useCallback(async () => {
    if (!novaMensagem.trim() || isLoading) return
    
    setIsLoading(true)
    
    try {
      const usuarioAtual = participantes.find(p => p.id === currentUserId)
      const mensagemId = Date.now().toString()
      
      const mensagem: ChatMessage = {
        id: mensagemId,
        contratoId,
        remetente: {
          id: currentUserId,
          nome: usuarioAtual?.nome || 'Usuário',
          avatar: usuarioAtual?.avatar,
          tipo: usuarioAtual?.tipo || 'usuario'
        },
        conteudo: novaMensagem.trim(),
        tipo: 'texto',
        dataEnvio: new Date().toISOString(),
        lida: true
      }
      
      setMensagens(prev => [...prev, mensagem])
      setNovaMensagem('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsLoading(false)
    }
  }, [novaMensagem, isLoading, contratoId, participantes, currentUserId])

  const handleMarcarComoAlteracao = useCallback((mensagem: ChatMessage) => {
    onMarcarComoAlteracao?.(mensagem)
  }, [onMarcarComoAlteracao])

  const formatarHorario = (dataHora: string) => {
    return new Date(dataHora).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  }


  const getTipoIcon = (tipo: string) => {
    const icons = {
      fiscal: <FileText className="h-3 w-3" />,
      gestor: <Users className="h-3 w-3" />,
      usuario: <MessageSquare className="h-3 w-3" />,
      sistema: <CheckCircle2 className="h-3 w-3" />
    }
    return icons[tipo as keyof typeof icons] || <MessageSquare className="h-3 w-3" />
  }

  return (
    <Card className={cn('flex h-full min-h-[700px] flex-col', className)}>
      {/* Header do Chat */}
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Observações do Contrato
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {numeroContrato} • Registre observações e acompanhamento
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {mensagens.filter(m => m.tipo !== 'sistema').length} observações
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Mensagens */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-white to-muted/10">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-6 space-y-6">
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
                      mensagem.tipo === 'sistema' && 'justify-center'
                    )}
                  >
                    {mensagem.tipo === 'sistema' ? (
                      // Mensagem do sistema
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
                        <p className="text-sm text-blue-700 flex items-center gap-2 justify-center font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          {mensagem.conteudo}
                        </p>
                        <span className="text-xs text-blue-600/70 mt-1 block">
                          {formatarHorario(mensagem.dataEnvio)}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Avatar (sempre mostrar para identificação) */}
                        {!isOwn && (
                          <div className="mt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={mensagem.remetente.avatar} alt={mensagem.remetente.nome} />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {mensagem.remetente.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}

                        {/* Conteúdo da mensagem */}
                        <div className={cn('flex-1', isOwn && 'flex flex-col items-end')}>
                          {!isOwn && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-foreground">{mensagem.remetente.nome}</span>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {getTipoIcon(mensagem.remetente.tipo)}
                                <span className="ml-1 capitalize">{mensagem.remetente.tipo}</span>
                              </Badge>
                            </div>
                          )}
                          
                          <div className="group relative">
                            <div
                              className={cn(
                                'rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm border',
                                isOwn
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-white border-border hover:shadow-md transition-shadow'
                              )}
                            >
                              {mensagem.conteudo}
                            </div>
                            
                            {/* Botão para marcar como alteração */}
                            {!isOwn && onMarcarComoAlteracao && (
                              <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 bg-white shadow-md border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                                  onClick={() => handleMarcarComoAlteracao(mensagem)}
                                  title="Marcar como alteração contratual"
                                >
                                  <Bookmark className="h-3 w-3 text-orange-600" />
                                </Button>
                              </div>
                            )}
                            
                            <div className={cn(
                              'text-xs text-muted-foreground mt-1',
                              isOwn && 'text-right'
                            )}>
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
      <div className="border-t bg-muted/20 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Nova Observação</span>
          </div>
          
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                {participantes.find(p => p.id === currentUserId)?.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Registre uma observação sobre o contrato (ex: 'Verificar prazo de entrega', 'Fornecedor solicitou esclarecimento sobre item X')..."
                className="min-h-[80px] resize-none border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-muted-foreground/70"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleEnviarMensagem()
                  }
                }}
              />
              
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">Enter</kbd> para enviar • 
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded ml-1">Shift+Enter</kbd> nova linha
                </p>
                
                <Button 
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Registrar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Dica:</strong> Use este espaço para registrar observações importantes sobre o contrato. 
              Passe o mouse sobre observações de outros usuários para marcá-las como alterações contratuais relevantes.
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}