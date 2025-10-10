/**
 * ==========================================
 * COMPONENTES DE BOTÃO ESPECIALIZADOS
 * ==========================================
 * Componentes estendidos do Button para casos específicos
 */

import * as React from 'react'
import { Button, buttonVariants } from './button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

// ==========================================
// LOADING BUTTON - Botão com estado de carregamento
// ==========================================

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  variant,
  size,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

// ==========================================
// ACTION BUTTON - Botão para ações rápidas em tabelas/cards
// ==========================================

interface ActionButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode
  tooltip?: string
  asChild?: boolean
}

export function ActionButton({
  icon,
  tooltip,
  children,
  variant = 'ghost',
  size = 'sm',
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('h-8 w-8 p-0', className)}
      title={tooltip}
      {...props}
    >
      {icon || children}
    </Button>
  )
}

// ==========================================
// ICON BUTTON - Botão apenas com ícone
// ==========================================

interface IconButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  icon: React.ReactNode
  'aria-label': string
  asChild?: boolean
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'icon',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button variant={variant} size={size} className={className} {...props}>
      {icon}
    </Button>
  )
}

// ==========================================
// CONFIRMATION BUTTON - Botão que requer confirmação
// ==========================================

interface ConfirmationButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  title?: string
  description?: string
  asChild?: boolean
}

export function ConfirmationButton({
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  title = 'Confirmar ação',
  description = 'Esta ação não pode ser desfeita.',
  children,
  onClick,
  ...props
}: ConfirmationButtonProps) {
  const [showConfirm, setShowConfirm] = React.useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    } else {
      setShowConfirm(true)
    }
  }

  const handleConfirm = () => {
    onConfirm()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="inline-flex gap-2">
        <Button variant="destructive" size="sm" onClick={handleConfirm}>
          {confirmText}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          {cancelText}
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}

// ==========================================
// BUTTON GROUP - Agrupamento de botões relacionados
// ==========================================

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'none' | 'sm' | 'md'
}

export function ButtonGroup({
  orientation = 'horizontal',
  spacing = 'sm',
  className,
  children,
  ...props
}: ButtonGroupProps) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  }

  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-1',
    md: 'gap-2',
  }

  return (
    <div
      role="group"
      className={cn(
        'inline-flex',
        orientationClasses[orientation],
        spacingClasses[spacing],
        '[&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md',
        orientation === 'vertical' &&
          '[&>button:first-child]:rounded-t-md [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-l-none [&>button:last-child]:rounded-b-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ==========================================
// LIST BUTTON - Botão para itens de lista/dropdown
// ==========================================

interface ListButtonProps extends React.ComponentProps<'button'> {
  selected?: boolean
  avatar?: React.ReactNode
  title: string
  description?: string
  trailing?: React.ReactNode
}

export function ListButton({
  selected = false,
  avatar,
  title,
  description,
  trailing,
  className,
  ...props
}: ListButtonProps) {
  return (
    <button
      className={cn(
        'w-full p-3 text-left transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'border-border border-b last:border-b-0',
        selected && 'bg-accent text-accent-foreground',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {avatar && <div className="flex-shrink-0">{avatar}</div>}

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium">{title}</h4>
          {description && (
            <p className="text-muted-foreground truncate text-xs">
              {description}
            </p>
          )}
        </div>

        {trailing && <div className="flex-shrink-0">{trailing}</div>}
      </div>
    </button>
  )
}

// ==========================================
// FLOATING ACTION BUTTON - Botão flutuante para ação principal
// ==========================================

interface FloatingActionButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  icon: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  asChild?: boolean
}

export function FloatingActionButton({
  icon,
  position = 'bottom-right',
  variant = 'default',
  size = 'lg',
  className,
  ...props
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'fixed z-50 h-14 w-14 rounded-full shadow-lg transition-shadow hover:shadow-xl',
        positionClasses[position],
        className,
      )}
      {...props}
    >
      {icon}
    </Button>
  )
}
