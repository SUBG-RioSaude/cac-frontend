/**
 * ==========================================
 * COMPONENTE DE EXIBIÇÃO DE VIGÊNCIA
 * ==========================================
 * Exibe período de vigência com indicadores visuais de início e fim
 */

import { Calendar, CalendarCheck, CalendarX, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateDisplay } from '@/components/ui/formatters'

interface VigenciaDisplayProps {
  vigenciaInicio?: string | null
  vigenciaFim?: string | null
  className?: string
  compact?: boolean
}

export function VigenciaDisplay({
  vigenciaInicio,
  vigenciaFim,
  className,
  compact = false,
}: VigenciaDisplayProps) {
  // Determinar status da vigência para ícone no modo compact
  const agora = new Date()
  const inicio = vigenciaInicio ? new Date(vigenciaInicio) : null
  const fim = vigenciaFim ? new Date(vigenciaFim) : null

  let status: 'ativa' | 'futura' | 'expirada' | 'indefinida' = 'indefinida'

  if (inicio && fim) {
    if (agora < inicio) {
      status = 'futura'
    } else if (agora > fim) {
      status = 'expirada'
    } else {
      status = 'ativa'
    }
  } else if (inicio && agora >= inicio) {
    status = 'ativa'
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'ativa':
        return <CalendarCheck className="h-3 w-3 text-green-600" />
      case 'futura':
        return <Clock className="h-3 w-3 text-blue-600" />
      case 'expirada':
        return <CalendarX className="h-3 w-3 text-red-600" />
      default:
        return <Calendar className="h-3 w-3 text-gray-600" />
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {getStatusIcon()}
        <span className="text-muted-foreground text-xs">
          {vigenciaInicio && vigenciaFim ? (
            <>
              <DateDisplay value={vigenciaInicio} /> -{' '}
              <DateDisplay value={vigenciaFim} />
            </>
          ) : vigenciaInicio ? (
            <>
              <DateDisplay value={vigenciaInicio} /> - ∞
            </>
          ) : (
            'Não definida'
          )}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      {vigenciaInicio && (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>
            Início: <DateDisplay value={vigenciaInicio} />
          </span>
        </div>
      )}

      {vigenciaFim ? (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>
            Fim: <DateDisplay value={vigenciaFim} />
          </span>
        </div>
      ) : (
        vigenciaInicio && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Por tempo indeterminado</span>
          </div>
        )
      )}
    </div>
  )
}
