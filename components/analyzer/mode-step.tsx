'use client'

import { Layers, Smile, Sparkles } from 'lucide-react'
import type { AnalysisMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const MODES: { id: AnalysisMode; title: string; body: string; icon: typeof Smile; outputs: string[] }[] = [
  {
    id: 'face',
    title: 'Face analysis',
    body: 'Age range, gender and expression, with wellness suggestions based on the emotion you confirm.',
    icon: Smile,
    outputs: ['Age', 'Gender', 'Emotion', 'Wellness'],
  },
  {
    id: 'skin',
    title: 'Face care',
    body: 'Acne, skin type and dark circles with a morning and evening routine. Use a clear, well-lit, front-facing photo.',
    icon: Sparkles,
    outputs: ['Acne', 'Skin type', 'Dark circles', 'Routine'],
  },
  {
    id: 'all',
    title: 'Full analysis',
    body: 'Everything in one pass through the shared backbone.',
    icon: Layers,
    outputs: ['All heads', 'Wellness', 'Skincare'],
  },
]

export function ModeStep({
  value,
  onChange,
  onBack,
  onContinue,
}: {
  value: AnalysisMode
  onChange: (m: AnalysisMode) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">What would you like to analyze?</h1>
        <p className="mt-1 text-muted-foreground">You can run another mode afterwards with the same photo.</p>
      </div>

      <div role="radiogroup" aria-label="Analysis mode" className="grid gap-3 md:grid-cols-3">
        {MODES.map(({ id, title, body, icon: Icon, outputs }) => {
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(id)}
              className={cn(
                'flex flex-col gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                selected ? 'border-primary ring-1 ring-primary' : 'hover:border-foreground/30',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg',
                    selected ? 'bg-primary text-primary-foreground' : 'bg-secondary',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'size-4 rounded-full border-2',
                    selected ? 'border-primary bg-primary shadow-[inset_0_0_0_2px_var(--card)]' : 'border-input',
                  )}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
              <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Outputs">
                {outputs.map((o) => (
                  <li key={o} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {o}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="lg" className="h-10 px-4" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" className="h-10 px-4" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
