'use client'

import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EMOTION_CONFIDENCE_THRESHOLD, EMOTIONS, type AnalysisResult, type Emotion } from '@/lib/types'
import { cn } from '@/lib/utils'
import { EmotionBars, EMOTION_LABELS } from './emotion-bars'

interface ConfirmEmotionStepProps {
  emotion: NonNullable<AnalysisResult['emotion']>
  preview: string
  selected: Emotion
  onSelect: (e: Emotion) => void
  onConfirm: () => void
}

export function ConfirmEmotionStep({ emotion, preview, selected, onSelect, onConfirm }: ConfirmEmotionStepProps) {
  const uncertain = emotion.confidence < EMOTION_CONFIDENCE_THRESHOLD

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Does this look right?</h1>
          <p className="mt-1 text-pretty leading-relaxed text-muted-foreground">
            We read facial expressions, not feelings. Confirm or change the emotion before we suggest anything.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img src={preview} alt="Your photo" className="size-20 rounded-lg object-cover" />
          <div>
            <p className="text-xs text-muted-foreground">Detected expression</p>
            <p className="text-xl font-semibold">{uncertain ? 'Uncertain' : EMOTION_LABELS[emotion.label]}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {uncertain ? `Top guess ${EMOTION_LABELS[emotion.label]} · ` : ''}
              {Math.round(emotion.confidence * 100)}% confidence
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium">Model probabilities</p>
          <EmotionBars probs={emotion.probs} highlight={selected} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <fieldset className="rounded-xl border bg-card p-5 shadow-sm">
          <legend className="sr-only">How are you feeling?</legend>
          <p className="font-medium" aria-hidden="true">
            How are you feeling?
          </p>
          <p className="text-sm text-muted-foreground">Pick the one that fits best. Recommendations follow your choice.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Emotion">
            {EMOTIONS.map((e) => {
              const active = e === selected
              return (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onSelect(e)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border px-3 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    active ? 'border-primary bg-system font-medium text-system-foreground' : 'hover:bg-secondary',
                  )}
                >
                  {EMOTION_LABELS[e]}
                  {e === emotion.label && <span className="text-xs font-normal opacity-70">Model guess</span>}
                </button>
              )
            })}
          </div>
        </fieldset>

        <p className="flex gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Expression recognition is around 65–72% accurate on real-world photos. Your answer always wins.
        </p>

        <Button size="lg" className="h-10 w-full px-4 sm:w-fit" onClick={onConfirm}>
          {selected === emotion.label ? 'Yes, show my results' : `Use “${EMOTION_LABELS[selected]}” and show results`}
        </Button>
      </div>
    </div>
  )
}
