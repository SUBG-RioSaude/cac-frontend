import React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export type StepStatus = 'pending' | 'current' | 'completed'

export interface Step {
  id: string
  label: string
  description?: string
  status: StepStatus
}

interface StepperProps {
  steps: Step[]
  className?: string
}

export const Stepper = ({ steps, className }: StepperProps) => {
  return (
    <nav aria-label="Progresso" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isPending = step.status === 'pending'
          const isLast = stepIdx === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex flex-1 flex-col items-center',
                !isLast && 'pr-8 sm:pr-20',
              )}
            >
              {/* Conector (linha entre steps) */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2',
                    isCompleted ? 'bg-primary' : 'bg-muted',
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Círculo do step */}
              <div className="relative flex items-center justify-center">
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      'border-primary bg-background text-primary ring-4 ring-primary/20',
                    isPending && 'border-muted bg-background text-muted-foreground',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{stepIdx + 1}</span>
                  )}
                </span>
              </div>

              {/* Label e descrição */}
              <div className="mt-3 flex flex-col items-center text-center">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-foreground',
                    isPending && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span
                    className={cn(
                      'mt-1 text-xs transition-colors',
                      isCompleted && 'text-primary/70',
                      isCurrent && 'text-muted-foreground',
                      isPending && 'text-muted-foreground/70',
                    )}
                  >
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Hook helper para gerenciar estado do stepper
 */
export const useStepper = (totalSteps: number, initialStep = 0) => {
  const [currentStep, setCurrentStep] = React.useState(initialStep)

  const next = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  const previous = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const goTo = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)))
  }

  const reset = () => {
    setCurrentStep(initialStep)
  }

  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return {
    currentStep,
    next,
    previous,
    goTo,
    reset,
    isFirst,
    isLast,
  }
}
