import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepId = 'consent' | 'mode' | 'capture' | 'analyzing' | 'confirm' | 'results'
type Actor = 'user' | 'system' | 'output'

const STEPS: { id: StepId; label: string; actor: Actor }[] = [
  { id: 'consent', label: 'Consent', actor: 'user' },
  { id: 'mode', label: 'Mode', actor: 'user' },
  { id: 'capture', label: 'Capture', actor: 'user' },
  { id: 'analyzing', label: 'Analyze', actor: 'system' },
  { id: 'confirm', label: 'Confirm', actor: 'user' },
  { id: 'results', label: 'Results', actor: 'output' },
]

const actorStyles: Record<Actor, string> = {
  user: 'border-foreground/30 bg-secondary text-secondary-foreground',
  system: 'border-system-foreground/50 bg-system text-system-foreground',
  output: 'border-output-foreground/50 bg-output text-output-foreground',
}

export function Stepper({ current, skipConfirm }: { current: StepId; skipConfirm: boolean }) {
  const steps = skipConfirm ? STEPS.filter((s) => s.id !== 'confirm') : STEPS
  const currentIndex = steps.findIndex((s) => s.id === current)

  return (
    <nav aria-label="Progress">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {steps.map((step, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li key={step.id} className="flex items-center gap-1">
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity',
                  actorStyles[step.actor],
                  !active && !done && 'opacity-50',
                  active && 'ring-2 ring-ring/30',
                )}
              >
                {done ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <span className="font-mono text-[10px]" aria-hidden="true">
                    {i + 1}
                  </span>
                )}
                {step.label}
                {done && <span className="sr-only">(completed)</span>}
              </span>
              {i < steps.length - 1 && <span className="h-px w-3 bg-border" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend className={actorStyles.user} label="You act" />
        <Legend className={actorStyles.system} label="System runs" />
        <Legend className={actorStyles.output} label="You see output" />
      </div>
    </nav>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-sm border', className)} aria-hidden="true" />
      {label}
    </span>
  )
}
