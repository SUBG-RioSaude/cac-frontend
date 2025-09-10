import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DateDisplay } from '@/components/ui/formatters'
import {
  Reply,
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ChatMessage as ChatMessageType } from '@/modules/Contratos/types/timeline'

interface ChatMessageProps {
  mensagem: ChatMessageType
  isOwn: boolean
  showAvatar?: boolean
  onResponder?: (mensagemId: string) => void
  onEditar?: (mensagemId: string) => void
  onExcluir?: (mensagemId: string) => void
  className?: string
}

export function ChatMessage({
  mensagem,
  isOwn,
  showAvatar = true,
  onResponder,
  onEditar,
  onExcluir,
  className
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false)

  const formatarHora = (dataHora: string) => {
    try {
      return new Date(dataHora).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }


  const getTipoMensagemBadge = () => {
    switch (mensagem.tipo) {
      case 'sistema':
        return (
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            Sistema
          </Badge>
        )
      case 'alteracao_contratual':
        return (
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            Alteração Contratual
          </Badge>
        )
      default:
        return null
    }
  }

  const getRemetenteColor = () => {
    switch (mensagem.remetente.tipo) {
      case 'fiscal':
        return 'text-green-600'
      case 'gestor':
        return 'text-blue-600'
      case 'sistema':
        return 'text-gray-600'
      default:
        return 'text-gray-800'
    }
  }


  // Mensagem do sistema tem layout diferente
  if (mensagem.tipo === 'sistema') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('flex justify-center py-2', className)}
      >
        <div className="max-w-xs rounded-full bg-muted px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">{mensagem.conteudo}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatarHora(mensagem.dataEnvio)}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex gap-3 py-2',
        isOwn ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar (apenas para mensagens de outros usuários) */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage 
            src={mensagem.remetente.avatar} 
            alt={mensagem.remetente.nome}
          />
          <AvatarFallback className="text-xs">
            {mensagem.remetente.nome
              .split(' ')
              .map(n => n[0])
              .join('')
              .substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Conteúdo da mensagem */}
      <div className={cn(
        'flex max-w-[70%] flex-col',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* Header da mensagem (nome e tipo) */}
        {!isOwn && showAvatar && (
          <div className="mb-1 flex items-center gap-2">
            <span className={cn('text-xs font-medium', getRemetenteColor())}>
              {mensagem.remetente.nome}
            </span>
            {getTipoMensagemBadge()}
          </div>
        )}

        {/* Bolha da mensagem */}
        <div className={cn(
          'relative rounded-2xl px-4 py-2 text-sm',
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-muted text-foreground',
          mensagem.tipo === 'alteracao_contratual' && 'border-2 border-orange-200'
        )}>
          {/* Conteúdo */}
          <div className="space-y-2">
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {mensagem.conteudo}
            </p>
            
          </div>

          {/* Metadados da mensagem */}
          <div className={cn(
            'mt-2 flex items-center justify-between gap-2 text-xs',
            isOwn ? 'text-blue-100' : 'text-muted-foreground'
          )}>
            <span>{formatarHora(mensagem.dataEnvio)}</span>
            
            <div className="flex items-center gap-1">
              {mensagem.editada && (
                <span className="italic">editada</span>
              )}
              
              {isOwn && (
                <div className="flex items-center gap-1">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    mensagem.lida ? 'bg-white' : 'bg-blue-200'
                  )} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações da mensagem (aparecem no hover) */}
        {(showActions || window.innerWidth < 640) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'mt-1 flex items-center gap-1',
              isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {onResponder && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onResponder(mensagem.id)}
                title="Responder"
              >
                <Reply className="h-3 w-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(mensagem.conteudo)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Reply className="mr-2 h-4 w-4" />
                  Responder
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  <DateDisplay value={mensagem.dataEnvio} options={{
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }} />
                </DropdownMenuItem>
                
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />
                    
                    {onEditar && (
                      <DropdownMenuItem onClick={() => onEditar(mensagem.id)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    
                    {onExcluir && (
                      <DropdownMenuItem 
                        onClick={() => onExcluir(mensagem.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}