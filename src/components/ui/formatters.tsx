/**
 * ==========================================
 * COMPONENTES DE FORMATAÇÃO REUTILIZÁVEIS
 * ==========================================
 * Componentes centralizados para exibir valores formatados
 */

import { cn } from '@/lib/utils'
import {
  currencyUtils,
  dateUtils,
  cnpjUtils,
  cepUtils,
  phoneUtils,
} from '@/lib/utils'

// Props base para todos os componentes de formatação
interface BaseFormatterProps {
  className?: string
  fallback?: string
}

// ==========================================
// FORMATAÇÃO MONETÁRIA
// ==========================================

interface CurrencyDisplayProps extends BaseFormatterProps {
  value: number | string | null | undefined
  showZero?: boolean
}

export function CurrencyDisplay({
  value,
  className,
  fallback = 'R$ 0,00',
  showZero = true,
}: CurrencyDisplayProps) {
  if (value === null || value === undefined) {
    return <span className={className}>{fallback}</span>
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numericValue)) {
    return <span className={className}>{fallback}</span>
  }

  if (numericValue === 0 && !showZero) {
    return <span className={className}>{fallback}</span>
  }

  return (
    <span className={cn('font-mono', className)}>
      {currencyUtils.formatar(numericValue)}
    </span>
  )
}

// ==========================================
// FORMATAÇÃO DE DATAS
// ==========================================

interface DateDisplayProps extends BaseFormatterProps {
  value: string | null | undefined
  format?: 'default' | 'custom' | 'datetime'
  options?: Intl.DateTimeFormatOptions
}

export function DateDisplay({
  value,
  className,
  fallback = 'Data inválida',
  format = 'default',
  options,
}: DateDisplayProps) {
  if (!value) {
    return <span className={className}>{fallback}</span>
  }

  const formattedDate =
    format === 'custom'
      ? dateUtils.formatarDataUTCCustom(value, options || {})
      : format === 'datetime'
        ? new Date(value).toLocaleString('pt-BR')
        : dateUtils.formatarDataUTC(value)

  if (!formattedDate) {
    return <span className={className}>{fallback}</span>
  }

  return <span className={className}>{formattedDate}</span>
}

// ==========================================
// FORMATAÇÃO DE DOCUMENTOS
// ==========================================

interface DocumentDisplayProps extends BaseFormatterProps {
  value: string | null | undefined
  type: 'cnpj' | 'cep' | 'phone'
}

export function DocumentDisplay({
  value,
  type,
  className,
  fallback = 'N/A',
}: DocumentDisplayProps) {
  if (!value) {
    return <span className={className}>{fallback}</span>
  }

  let formattedValue: string

  switch (type) {
    case 'cnpj':
      formattedValue = cnpjUtils.formatar(value)
      break
    case 'cep':
      formattedValue = cepUtils.formatar(value)
      break
    case 'phone':
      formattedValue = phoneUtils.formatar(value)
      break
    default:
      formattedValue = value
  }

  return <span className={cn('font-mono', className)}>{formattedValue}</span>
}

// ==========================================
// COMPONENTES ESPECÍFICOS (CONVENIENCE)
// ==========================================

// Componente específico para CNPJ
interface CNPJDisplayProps extends BaseFormatterProps {
  value: string | null | undefined
}

export function CNPJDisplay({
  value,
  className,
  fallback = 'CNPJ inválido',
}: CNPJDisplayProps) {
  return (
    <DocumentDisplay
      value={value}
      type="cnpj"
      className={className}
      fallback={fallback}
    />
  )
}

// Componente específico para CEP
interface CEPDisplayProps extends BaseFormatterProps {
  value: string | null | undefined
}

export function CEPDisplay({
  value,
  className,
  fallback = 'CEP inválido',
}: CEPDisplayProps) {
  return (
    <DocumentDisplay
      value={value}
      type="cep"
      className={className}
      fallback={fallback}
    />
  )
}

// Componente específico para Telefone
interface PhoneDisplayProps extends BaseFormatterProps {
  value: string | null | undefined
}

export function PhoneDisplay({
  value,
  className,
  fallback = 'Telefone inválido',
}: PhoneDisplayProps) {
  return (
    <DocumentDisplay
      value={value}
      type="phone"
      className={className}
      fallback={fallback}
    />
  )
}

// ==========================================
// FORMATAÇÃO COM ÍCONES (OPCIONAL)
// ==========================================

import { DollarSign, Calendar, Hash, MapPin, Phone } from 'lucide-react'

interface IconFormatterProps extends BaseFormatterProps {
  showIcon?: boolean
  iconSize?: 'sm' | 'default' | 'lg'
}

const iconSizes = {
  sm: 'h-3 w-3',
  default: 'h-4 w-4',
  lg: 'h-5 w-5',
}

// Moeda com ícone
interface CurrencyWithIconProps
  extends CurrencyDisplayProps,
    IconFormatterProps {}

export function CurrencyWithIcon({
  showIcon = true,
  iconSize = 'default',
  ...props
}: CurrencyWithIconProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {showIcon && <DollarSign className={iconSizes[iconSize]} />}
      <CurrencyDisplay {...props} className="" />
    </span>
  )
}

// Data com ícone
interface DateWithIconProps extends DateDisplayProps, IconFormatterProps {}

export function DateWithIcon({
  showIcon = true,
  iconSize = 'default',
  ...props
}: DateWithIconProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {showIcon && <Calendar className={iconSizes[iconSize]} />}
      <DateDisplay {...props} className="" />
    </span>
  )
}

// CNPJ com ícone
interface CNPJWithIconProps extends CNPJDisplayProps, IconFormatterProps {}

export function CNPJWithIcon({
  showIcon = true,
  iconSize = 'default',
  ...props
}: CNPJWithIconProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {showIcon && <Hash className={iconSizes[iconSize]} />}
      <CNPJDisplay {...props} className="" />
    </span>
  )
}

// CEP com ícone
interface CEPWithIconProps extends CEPDisplayProps, IconFormatterProps {}

export function CEPWithIcon({
  showIcon = true,
  iconSize = 'default',
  ...props
}: CEPWithIconProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {showIcon && <MapPin className={iconSizes[iconSize]} />}
      <CEPDisplay {...props} className="" />
    </span>
  )
}

// Telefone com ícone
interface PhoneWithIconProps extends PhoneDisplayProps, IconFormatterProps {}

export function PhoneWithIcon({
  showIcon = true,
  iconSize = 'default',
  ...props
}: PhoneWithIconProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {showIcon && <Phone className={iconSizes[iconSize]} />}
      <PhoneDisplay {...props} className="" />
    </span>
  )
}
