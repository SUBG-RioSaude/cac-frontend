'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: {
    title: string
    description?: string
    status: 'completed' | 'current' | 'upcoming'
  }[]
  currentStep: number
}


const steps = [
  {
    title: 'Step 1',
    status: 'completed',
  },
  
]

export function Steps({ steps, currentStep, className, ...props }: StepsProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-20 py-6', className)}
      {...props}
    >
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-full',
                step.status === 'completed'
                  ? 'bg-sky-400 text-white'
                  : step.status === 'current'
                    ? 'bg-white text-neutral-600 ring-2 ring-neutral-300'
                    : 'bg-white text-neutral-600 ring-2 ring-neutral-300',
              )}
            >
              {step.status === 'completed' ? (
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
                  step.status === 'completed' ? 'bg-sky-400' : 'bg-neutral-300',
                )}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
