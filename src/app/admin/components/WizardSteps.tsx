'use client'

import { Check } from 'lucide-react'

interface WizardStepsProps {
  steps: { num: number; label: string }[]
  current: number
  onJump?: (num: number) => void
}

export default function WizardSteps({ steps, current, onJump }: WizardStepsProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isCompleted = step.num < current
        const isCurrent = step.num === current
        const isClickable = !!onJump && isCompleted

        const circleClasses = isCompleted
          ? 'bg-verde text-white'
          : isCurrent
          ? 'bg-terracota text-white ring-2 ring-terracota/30'
          : 'bg-neutro-borde text-verde-suave'

        const labelClasses = isCurrent
          ? 'bg-terracota/10 text-terracota font-medium'
          : isCompleted
          ? 'text-verde'
          : 'text-verde-suave'

        const lineClasses = step.num < current ? 'bg-verde' : 'bg-neutro-borde'

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (isClickable) onJump?.(step.num)
                }}
                disabled={!isClickable}
                aria-label={`Paso ${step.num}: ${step.label}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${circleClasses} ${
                  isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.num}
              </button>
              <span
                className={`mt-1 text-xs px-2 py-0.5 rounded ${labelClasses} whitespace-nowrap`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${lineClasses}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
