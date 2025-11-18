import { ChevronLeft, ChevronRight, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious?: () => void
  onNext?: () => void
  onFinish?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  isLastStep?: boolean
  isLoading?: boolean
  nextLabel?: string
  previousLabel?: string
  finishLabel?: string
  className?: string
}

export const WizardNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onFinish,
  canGoNext = true,
  canGoPrevious = true,
  isLastStep = false,
  isLoading = false,
  nextLabel = 'Próximo',
  previousLabel = 'Voltar',
  finishLabel = 'Finalizar',
  className,
}: WizardNavigationProps) => {
  const isFirstStep = currentStep === 0

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Botão Voltar */}
      <div>
        {!isFirstStep && onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
          >
            <ChevronLeft className="mr-2 size-4" />
            {previousLabel}
          </Button>
        )}
      </div>

      {/* Indicador de progresso */}
      <div className="text-sm text-muted-foreground">
        Passo {currentStep + 1} de {totalSteps}
      </div>

      {/* Botão Próximo ou Finalizar */}
      <div>
        {!isLastStep && onNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
          >
            {nextLabel}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        )}

        {isLastStep && onFinish && (
          <Button
            type="button"
            onClick={onFinish}
            disabled={!canGoNext || isLoading}
          >
            <Save className="mr-2 size-4" />
            {finishLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
