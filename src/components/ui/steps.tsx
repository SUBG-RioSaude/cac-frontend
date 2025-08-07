'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { Button } from './button'

interface Step {
  title: string
  description?: string
}

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  renderStepContent: (currentStep: number) => React.ReactNode
  showNavigation?: boolean
  navigationLabels?: {
    previous: string
    next: string
    finish: string
  }
  confirmAdvance?: boolean
  onAdvanceRequest?: (nextStep: number) => void
}

export function Steps({
  steps,
  currentStep,
  onStepChange,
  renderStepContent,
  showNavigation = true,
  navigationLabels = {
    previous: 'Anterior',
    next: 'Próximo',
    finish: 'Finalizar',
  },
  confirmAdvance = false,
  onAdvanceRequest,
  className,
  ...props
}: StepsProps) {
  const handleProximoStep = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1
      if (confirmAdvance && onAdvanceRequest) {
        onAdvanceRequest(nextStep)
      } else {
        onStepChange(nextStep)
      }
    }
  }

  const handleStepAnterior = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1)
    }
  }

  const getStepStatus = (
    stepIndex: number,
  ): 'completed' | 'current' | 'upcoming' => {
    const stepNumber = stepIndex + 1
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'upcoming'
  }

  return (
    <div className={cn('space-y-8', className)} {...props}>
      {/* Indicador visual dos steps */}
      <div className="flex items-center justify-center gap-20 py-6">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'relative flex h-16 w-16 items-center justify-center rounded-full',
                    status === 'completed'
                      ? 'bg-sky-400 text-white'
                      : status === 'current'
                        ? 'bg-white text-neutral-600 ring-2 ring-neutral-300'
                        : 'bg-white text-neutral-600 ring-2 ring-neutral-300',
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-8 w-8" strokeWidth={3} />
                  ) : (
                    <span className="text-4xl font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="mt-2 text-sm font-medium text-neutral-600">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1">
                  <div
                    className={cn(
                      'h-0.5 w-full',
                      status === 'completed' ? 'bg-sky-400' : 'bg-neutral-300',
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Conteúdo do step atual */}
      <div>{renderStepContent(currentStep)}</div>

      {/* Navegação */}
      {showNavigation && (
        <div className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={handleStepAnterior}
            disabled={currentStep === 1}
          >
            {navigationLabels.previous}
          </Button>
          <Button
            onClick={handleProximoStep}
            disabled={currentStep === steps.length}
          >
            {currentStep === steps.length
              ? navigationLabels.finish
              : navigationLabels.next}
          </Button>
        </div>
      )}
    </div>
  )
}
