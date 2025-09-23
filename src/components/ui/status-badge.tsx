/**
 * ==========================================
 * COMPONENTE UNIVERSAL DE STATUS BADGE
 * ==========================================
 * Componente centralizado para todos os badges de status do sistema
 */

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useStatusConfig } from '@/hooks/use-status-config'
import type { StatusBadgeProps } from '@/types/status'

export function StatusBadge({
  status,
  domain,
  size = 'default',
  showIcon = false,
  className,
  ...props
}: StatusBadgeProps) {
  const { getStatusConfig } = useStatusConfig()
  const config = getStatusConfig(status, domain)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    default: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }

  const IconComponent = showIcon && config.icon ? config.icon : null

  return (
    <Badge
      className={cn(
        config.className,
        sizeClasses[size],
        'inline-flex items-center gap-1 font-medium',
        className,
      )}
      {...props}
    >
      {IconComponent && (
        <IconComponent className={cn(iconSizes[size], 'shrink-0')} />
      )}
      <span className={config.className}>{config.label}</span>
    </Badge>
  )
}

// Componentes especializados para cada domínio (opcionais, para convenience)
export function ContratoStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'domain'>) {
  return <StatusBadge status={status} domain="contrato" {...props} />
}

export function FornecedorStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'domain'>) {
  return <StatusBadge status={status} domain="fornecedor" {...props} />
}

export function UnidadeStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'domain'>) {
  return <StatusBadge status={status} domain="unidade" {...props} />
}

// Hook para facilitar o uso com lógica de vigência de contratos
export function useContratoStatus(
  vigenciaInicial?: string | null,
  vigenciaFinal?: string | null,
  statusAtual?: string | null,
) {
  const { getContratoStatusFromVigencia } = useStatusConfig()

  return getContratoStatusFromVigencia(
    vigenciaInicial,
    vigenciaFinal,
    statusAtual,
  )
}
