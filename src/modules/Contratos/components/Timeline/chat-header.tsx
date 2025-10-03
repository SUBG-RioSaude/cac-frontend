import { motion } from 'framer-motion'
import {
  Users,
  Settings,
  Search,
  MoreVertical,
  Circle,
  Phone,
  Video,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ChatParticipante } from '@/modules/Contratos/types/timeline'

interface ChatHeaderProps {
  numeroContrato: string
  participantes: ChatParticipante[]
  mensagensNaoLidas: number
  onBuscar?: () => void
  onConfiguracoes?: () => void
  onMostrarParticipantes?: () => void
  className?: string
}

export const ChatHeader = ({
  numeroContrato,
  participantes,
  mensagensNaoLidas,
  onBuscar,
  onConfiguracoes,
  onMostrarParticipantes,
  className,
}: ChatHeaderProps) => {
  const participantesOnline = participantes.filter((p) => p.status === 'online')
  const participantesAtivos = participantes.slice(0, 3) // Mostrar apenas os 3 primeiros

  const getStatusColor = (status: ChatParticipante['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'ausente':
        return 'text-yellow-500'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusLabel = (status: ChatParticipante['status']) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'ausente':
        return 'Ausente'
      default:
        return 'Offline'
    }
  }

  return (
    <div className={cn('border-b bg-white p-4', className)}>
      <div className="flex items-center justify-between">
        {/* Informações do contrato */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Chat - {numeroContrato}</h3>
              {mensagensNaoLidas > 0 && (
                <Badge className="bg-red-500 px-2 py-0 text-xs text-white">
                  {mensagensNaoLidas}
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Circle
                className={cn('h-2 w-2 fill-current', getStatusColor('online'))}
              />
              <span>
                {participantesOnline.length} de {participantes.length}{' '}
                participantes online
              </span>
            </div>
          </div>
        </div>

        {/* Participantes ativos */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex -space-x-2">
              {participantesAtivos.map((participante) => (
                <motion.div
                  key={participante.id}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className="relative"
                >
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage
                      src={participante.avatar}
                      alt={participante.nome}
                    />
                    <AvatarFallback className="text-xs">
                      {participante.nome
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Indicador de status */}
                  <div
                    className={cn(
                      'absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white',
                      participante.status === 'online'
                        ? 'bg-green-500'
                        : participante.status === 'ausente'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400',
                    )}
                  />
                </motion.div>
              ))}
            </div>

            {participantes.length > 3 && (
              <button
                onClick={onMostrarParticipantes}
                className="bg-muted text-muted-foreground hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
              >
                +{participantes.length - 3}
              </button>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Ações do header */}
          <div className="flex items-center gap-1">
            {onBuscar && (
              <Button variant="ghost" size="sm" onClick={onBuscar}>
                <Search className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onMostrarParticipantes && (
                  <DropdownMenuItem onClick={onMostrarParticipantes}>
                    <Users className="mr-2 h-4 w-4" />
                    Ver Participantes ({participantes.length})
                  </DropdownMenuItem>
                )}

                {onBuscar && (
                  <DropdownMenuItem onClick={onBuscar}>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Mensagens
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem disabled>
                  <Phone className="mr-2 h-4 w-4" />
                  Iniciar Chamada
                </DropdownMenuItem>

                <DropdownMenuItem disabled>
                  <Video className="mr-2 h-4 w-4" />
                  Videoconferência
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {onConfiguracoes && (
                  <DropdownMenuItem onClick={onConfiguracoes}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Status detalhado dos participantes (mobile) */}
      <div className="mt-3 block sm:hidden">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">
            Participantes ({participantes.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {participantesAtivos.map((participante) => (
              <div
                key={participante.id}
                className="bg-muted flex items-center gap-2 rounded-full px-3 py-1"
              >
                <Circle
                  className={cn(
                    'h-2 w-2 fill-current',
                    getStatusColor(participante.status),
                  )}
                />
                <span className="text-xs font-medium">
                  {participante.nome.split(' ')[0]}
                </span>
                <span className="text-muted-foreground text-xs">
                  {getStatusLabel(participante.status)}
                </span>
              </div>
            ))}

            {participantes.length > 3 && (
              <button
                onClick={onMostrarParticipantes}
                className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-full px-3 py-1 text-xs font-medium"
              >
                +{participantes.length - 3} mais
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
