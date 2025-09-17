import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className,
      )}
    />
  )
}

interface LoadingFallbackProps {
  message?: string
  showSpinner?: boolean
}

export function LoadingFallback({
  message = 'Carregando...',
  showSpinner = true,
}: LoadingFallbackProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        {showSpinner && <LoadingSpinner />}
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  )
}

export function FormLoadingFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

export function ButtonLoadingSpinner({ className }: { className?: string }) {
  return (
    <LoadingSpinner
      size="sm"
      className={cn('border-white border-t-transparent', className)}
    />
  )
}
