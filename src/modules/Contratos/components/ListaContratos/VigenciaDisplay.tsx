/**
 * ==========================================
 * COMPONENTE DE EXIBIÇÃO DE VIGÊNCIA
 * ==========================================
 * Exibe período de vigência com indicadores visuais de início e fim
 */

import { Calendar, CalendarCheck, CalendarX, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  compact = false 
}: VigenciaDisplayProps) {
  const formatarData = (data: string | null | undefined): string => {
    if (!data) return '-'
    
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const dataInicio = formatarData(vigenciaInicio)
  const dataFim = formatarData(vigenciaFim)

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
      <div className={cn("flex items-center gap-1", className)}>
        {getStatusIcon()}
        <span className="text-xs text-muted-foreground">
          {dataInicio !== '-' && dataFim !== '-' ? (
            `${dataInicio} - ${dataFim}`
          ) : dataInicio !== '-' ? (
            `${dataInicio} - ∞`
          ) : (
            'Não definida'
          )}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      {dataInicio !== '-' && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Início: {dataInicio}</span>
        </div>
      )}
      
      {dataFim !== '-' ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Fim: {dataFim}</span>
        </div>
      ) : vigenciaInicio && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Por tempo indeterminado</span>
        </div>
      )}
    </div>
  )
}