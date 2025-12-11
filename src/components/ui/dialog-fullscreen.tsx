/**
 * ==========================================
 * COMPONENTE: DIALOG-FULLSCREEN
 * ==========================================
 * Dialog customizado para visualização fullscreen
 * Baseado no Radix UI Dialog sem limitações de tamanho do shadcn
 */

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

// ========== ROOT ==========

function DialogFullscreen({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

// ========== OVERLAY ==========

function DialogFullscreenOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/80',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

// ========== CONTENT ==========

function DialogFullscreenContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogFullscreenOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 bg-background',
          'w-[95vw] h-[95vh] max-w-[1400px] max-h-[900px]',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'rounded-lg shadow-lg',
          'flex flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

// ========== CLOSE BUTTON ==========

function DialogFullscreenClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(
        'rounded-sm opacity-70 hover:opacity-100',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-opacity',
        'h-8 w-8 flex items-center justify-center',
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Fechar</span>
    </DialogPrimitive.Close>
  )
}

// ========== EXPORTS ==========

export {
  DialogFullscreen,
  DialogFullscreenOverlay,
  DialogFullscreenContent,
  DialogFullscreenClose,
}
