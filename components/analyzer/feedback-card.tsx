'use client'

import { useState } from 'react'
import { CheckCircle2, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function FeedbackCard({ predictionId, hasEmotion }: { predictionId: string; hasEmotion: boolean }) {
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  async function send(value: boolean) {
    setHelpful(value)
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId, helpful: value }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <section className="flex items-center gap-3 rounded-xl border border-output-foreground/25 bg-output p-4 text-output-foreground" role="status">
        <CheckCircle2 className="size-5" aria-hidden="true" />
        <p className="text-sm">Thanks. Your feedback is saved against this prediction only, never your photo.</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="feedback-heading" className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 id="feedback-heading" className="text-sm font-medium">
          Were these results helpful?
        </h2>
        <p className="text-xs text-muted-foreground">
          {hasEmotion ? 'Your emotion confirmation has already been recorded.' : 'Helps us tune the rules engine.'}
          {status === 'error' && <span className="text-destructive"> Could not send. Try again.</span>}
        </p>
      </div>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <Button
            key={String(v)}
            variant="outline"
            size="lg"
            className={cn('h-9 px-3', helpful === v && 'border-primary')}
            disabled={status === 'sending'}
            aria-pressed={helpful === v}
            onClick={() => send(v)}
          >
            {v ? <ThumbsUp data-icon="inline-start" aria-hidden="true" /> : <ThumbsDown data-icon="inline-start" aria-hidden="true" />}
            {v ? 'Helpful' : 'Not helpful'}
          </Button>
        ))}
      </div>
    </section>
  )
}
