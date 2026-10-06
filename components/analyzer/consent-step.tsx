'use client'

import { useId } from 'react'
import { ArrowRight, EyeOff, ShieldCheck, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PipelineDiagram } from './pipeline-diagram'

interface ConsentStepProps {
  agreed: boolean
  improveModel: boolean
  onAgreedChange: (v: boolean) => void
  onImproveModelChange: (v: boolean) => void
  onContinue: () => void
}

const POINTS = [
  {
    icon: EyeOff,
    title: 'Processed in memory',
    body: 'Your photo is analyzed and discarded. Nothing is written to disk unless you opt in below.',
  },
  {
    icon: ShieldCheck,
    title: 'No identity matching',
    body: 'We estimate age, gender, expression and skin features. We never recognize who you are.',
  },
  {
    icon: Stethoscope,
    title: 'Not medical advice',
    body: 'Expression is not mood, and skin findings are not a diagnosis. Tips are general self-care.',
  },
]

export function ConsentStep({ agreed, improveModel, onAgreedChange, onImproveModelChange, onContinue }: ConsentStepProps) {
  const agreeId = useId()
  const improveId = useId()

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-system-foreground">
            Multi-task facial analysis
          </p>
          <h1 className="text-pretty text-4xl font-semibold tracking-tight md:text-5xl">
            One photo. One forward pass. Practical, safe tips.
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Upload or capture a face photo to get age, gender and emotion estimates plus a skin-condition summary,
            followed by wellness and skincare recommendations you can trace back to a rule.
          </p>
        </div>

        <section aria-labelledby="consent-heading" className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 id="consent-heading" className="font-medium">
            Before we start
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-3 border-t pt-5">
            <label htmlFor={agreeId} className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox id={agreeId} checked={agreed} onCheckedChange={(v) => onAgreedChange(v === true)} className="mt-0.5" />
              <span>I understand how my photo is processed and that results are not medical advice.</span>
            </label>
            <label htmlFor={improveId} className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
              <Checkbox
                id={improveId}
                checked={improveModel}
                onCheckedChange={(v) => onImproveModelChange(v === true)}
                className="mt-0.5"
              />
              <span>Optional: help improve the model by allowing my photo to be stored. (Off by default)</span>
            </label>
          </div>

          <Button size="lg" className="mt-5 h-10 w-full px-4 sm:w-auto" disabled={!agreed} onClick={onContinue}>
            I understand, continue
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </section>
      </div>

      <PipelineDiagram />
    </div>
  )
}
