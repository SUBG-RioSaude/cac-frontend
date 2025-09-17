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
      <div className="relative">
        {/* Background decorativo neutro */}
        <div className="absolute inset-0 -mx-2 rounded-xl bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 py-4" />

        <div className="relative flex items-center justify-center gap-3 px-3 py-5 sm:gap-6 lg:gap-10">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 sm:h-12 sm:w-12',
                      status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                        : status === 'current'
                          ? 'bg-white text-blue-700 ring-2 shadow-blue-700/10 ring-blue-600/60'
                          : 'bg-gray-100 text-gray-500 ring-1 shadow-gray-200 ring-gray-300',
                    )}
                  >
                    {status === 'completed' ? (
                      <Check
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <span className="text-sm font-semibold sm:text-base">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="max-w-20 text-center sm:max-w-24">
                    <span
                      className={cn(
                        'text-xs font-medium transition-colors duration-300',
                        status === 'current'
                          ? 'font-semibold text-blue-700'
                          : status === 'completed'
                            ? 'font-medium text-emerald-600'
                            : 'text-gray-500',
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>

                {/* Linha conectora entre steps */}
                {index < steps.length - 1 && (
                  <div className="flex flex-1 items-center px-1">
                    <div className="relative w-full">
                      <div className="h-px w-full bg-gray-300" />
                      <div
                        className={cn(
                          'absolute top-0 left-0 h-px transition-all duration-500',
                          status === 'completed'
                            ? 'w-full bg-emerald-500'
                            : 'w-0 bg-emerald-500',
                        )}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Conteúdo do step atual */}
      <div className="relative">
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {renderStepContent(currentStep)}
        </div>
      </div>

      {/* Navegação */}
      {showNavigation && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <Button
            variant="outline"
            onClick={handleStepAnterior}
            disabled={currentStep === 1}
            className="px-6 py-2.5 font-medium transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {navigationLabels.previous}
          </Button>
          <Button
            onClick={handleProximoStep}
            disabled={currentStep === steps.length}
            className={cn(
              'px-6 py-2.5 font-medium transition-all duration-200',
              currentStep === steps.length
                ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-200 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-sky-500 to-sky-600 shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-sky-700',
            )}
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
