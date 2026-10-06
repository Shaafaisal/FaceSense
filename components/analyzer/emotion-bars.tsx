import { EMOTIONS, type Emotion } from '@/lib/types'
import { cn } from '@/lib/utils'

export const EMOTION_LABELS: Record<Emotion, string> = {
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  surprise: 'Surprise',
  fear: 'Fear',
  disgust: 'Disgust',
  neutral: 'Neutral',
}

export function EmotionBars({ probs, highlight }: { probs: Record<Emotion, number>; highlight?: Emotion }) {
  const sorted = [...EMOTIONS].sort((a, b) => probs[b] - probs[a])
  return (
    <ul className="flex flex-col gap-2" aria-label="Emotion probabilities">
      {sorted.map((e) => {
        const pct = Math.round(probs[e] * 100)
        const active = e === highlight
        return (
          <li key={e} className="grid grid-cols-[72px_1fr_40px] items-center gap-3 text-sm">
            <span className={cn(active ? 'font-semibold' : 'text-muted-foreground')}>
              {EMOTION_LABELS[e]}
              {active && <span className="sr-only"> (selected)</span>}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
              <span
                className={cn('block h-full rounded-full', active ? 'bg-primary' : 'bg-foreground/25')}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </span>
            <span className={cn('text-right font-mono text-xs tabular-nums', active ? 'font-semibold' : 'text-muted-foreground')}>
              {pct}%
            </span>
          </li>
        )
      })}
    </ul>
  )
}
