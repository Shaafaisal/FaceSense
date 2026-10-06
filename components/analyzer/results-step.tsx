'use client'

import { HeartHandshake, Moon, RotateCcw, ShieldAlert, Sparkles, Stethoscope, Sun, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSkincare, getWellness, isConfident } from '@/lib/knowledge-base'
import type { AnalysisMode, AnalysisResult, Emotion, SkinFinding } from '@/lib/types'
import { cn } from '@/lib/utils'
import { EmotionBars, EMOTION_LABELS } from './emotion-bars'
import { FeedbackCard } from './feedback-card'

interface ResultsStepProps {
  result: AnalysisResult
  preview: string
  mode: AnalysisMode
  confirmedEmotion: Emotion | null
  showSupportNote: boolean
  onRestart: () => void
  onSwitchMode: (m: AnalysisMode) => void
}

export function ResultsStep({ result, preview, mode, confirmedEmotion, showSupportNote, onRestart, onSwitchMode }: ResultsStepProps) {
  const [x, y, w, h] = result.face.bbox

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Your results</h1>
          <p className="mt-1 text-muted-foreground">Estimates from facial appearance. Every tip links to the rule that produced it.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode !== 'all' && (
            <Button variant="outline" size="lg" className="h-9 px-3" onClick={() => onSwitchMode(mode === 'face' ? 'skin' : 'face')}>
              {mode === 'face' ? 'Run face care' : 'Run face analysis'}
            </Button>
          )}
          <Button size="lg" className="h-9 px-3" onClick={onRestart}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            New photo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-4">
          <figure className="relative overflow-hidden rounded-xl border bg-muted shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={preview} alt="Analyzed photo with detected face box" className="aspect-[4/5] w-full object-cover" />
            <span
              className="absolute rounded-md border-2 border-output-foreground"
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
              aria-hidden="true"
            />
          </figure>
          <TimingCard timing={result.timing_ms} />
        </div>

        <div className="flex flex-col gap-4">
          {showSupportNote && (
            <div role="note" className="flex gap-3 rounded-xl border border-warning-foreground/25 bg-warning p-4 text-warning-foreground">
              <HeartHandshake className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-relaxed">
                You have reported feeling low more than once. If that feeling persists, consider talking to someone you trust
                or a mental-health professional. You do not have to handle it alone.
              </p>
            </div>
          )}

          {result.age && result.gender && result.emotion && confirmedEmotion && (
            <FaceSection result={result} confirmedEmotion={confirmedEmotion} />
          )}
          {result.skin && <SkinSection findings={result.skin} />}

          <p className="flex gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {result.recommendations.disclaimer}
          </p>

          <FeedbackCard predictionId={result.id} hasEmotion={Boolean(result.emotion)} />
        </div>
      </div>
    </div>
  )
}

function Card({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border bg-card p-5 shadow-sm', className)}>
      <h2 className="mb-4 flex items-center gap-2 font-medium">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-output p-3 text-output-foreground">
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="font-mono text-xs opacity-80">{sub}</p>}
    </div>
  )
}

function FaceSection({ result, confirmedEmotion }: { result: AnalysisResult; confirmedEmotion: Emotion }) {
  const { age, gender, emotion } = result
  if (!age || !gender || !emotion) return null
  const corrected = confirmedEmotion !== emotion.label
  const wellness = getWellness(confirmedEmotion)

  return (
    <>
      <Card title="Face analysis">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Age range" value={`${age.range[0]}–${age.range[1]}`} sub={`est. ${Math.round(age.estimate)}`} />
          <Stat label="Gender" value={gender.label === 'male' ? 'Male' : 'Female'} sub={`${Math.round(gender.confidence * 100)}% confidence`} />
          <Stat
            label="Emotion"
            value={EMOTION_LABELS[confirmedEmotion]}
            sub={corrected ? `you corrected · model said ${EMOTION_LABELS[emotion.label].toLowerCase()}` : `${Math.round(emotion.confidence * 100)}% · you confirmed`}
          />
        </div>
        <details className="group mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Show all emotion probabilities</summary>
          <div className="mt-3">
            <EmotionBars probs={emotion.probs} highlight={confirmedEmotion} />
          </div>
        </details>
      </Card>

      <Card title={`Wellness tips for feeling ${EMOTION_LABELS[confirmedEmotion].toLowerCase()}`} icon={<HeartHandshake className="size-4" aria-hidden="true" />}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {wellness.map((tip) => (
            <TipItem key={tip.rule} {...tip} />
          ))}
        </ul>
      </Card>
    </>
  )
}

function TipItem({ title, body, rule }: { title: string; body: string; rule: string }) {
  return (
    <li className="flex flex-col gap-1 rounded-lg border p-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      <p className="mt-auto pt-1 font-mono text-[11px] text-muted-foreground/80">
        <span className="sr-only">Rule: </span>
        {rule}
      </p>
    </li>
  )
}

function findingLabel(f: SkinFinding) {
  if (f.condition === 'acne') return { name: 'Acne', value: f.present ? `Present · ${f.severity}` : 'Not detected' }
  if (f.condition === 'skin_type') return { name: 'Skin type', value: f.type ? f.type[0].toUpperCase() + f.type.slice(1) : '—' }
  return { name: 'Dark circles', value: f.present ? 'Present' : 'Not detected' }
}

function SkinSection({ findings }: { findings: SkinFinding[] }) {
  const plan = getSkincare(findings)

  return (
    <>
      <Card title="Skin summary" icon={<Sparkles className="size-4" aria-hidden="true" />}>
        <ul className="grid gap-3 sm:grid-cols-3">
          {findings.map((f) => {
            const { name, value } = findingLabel(f)
            const confident = isConfident(f)
            const pct = Math.round(f.confidence * 100)
            return (
              <li key={f.condition} className={cn('rounded-lg p-3', confident ? 'bg-output text-output-foreground' : 'border border-dashed bg-card')}>
                <p className={cn('text-xs', confident ? 'opacity-80' : 'text-muted-foreground')}>{name}</p>
                <p className="text-lg font-semibold">{confident ? value : 'Not enough evidence'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn('h-1.5 flex-1 overflow-hidden rounded-full', confident ? 'bg-output-foreground/15' : 'bg-secondary')} aria-hidden="true">
                    <span className={cn('block h-full rounded-full', confident ? 'bg-output-foreground' : 'bg-muted-foreground/50')} style={{ width: `${pct}%` }} />
                  </span>
                  <span className={cn('font-mono text-xs tabular-nums', !confident && 'text-muted-foreground')}>{pct}%</span>
                </div>
                {!confident && <p className="mt-1 text-xs text-muted-foreground">Low confidence, so no tips are based on this.</p>}
              </li>
            )
          })}
        </ul>
      </Card>

      {plan.dermatologist && (
        <div role="note" className="flex gap-3 rounded-xl border border-warning-foreground/25 bg-warning p-4 text-warning-foreground">
          <Stethoscope className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            Moderate or severe acne was detected. Consider seeing a dermatologist, especially if it is persistent or painful.
          </p>
        </div>
      )}

      <Card title="Your routine">
        <div className="grid gap-4 md:grid-cols-2">
          <RoutineColumn title="Morning" icon={<Sun className="size-4" aria-hidden="true" />} steps={plan.morning} />
          <RoutineColumn title="Evening" icon={<Moon className="size-4" aria-hidden="true" />} steps={plan.evening} />
        </div>
        <h3 className="mb-3 mt-5 text-sm font-medium">Lifestyle tips</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {plan.tips.map((tip) => (
            <TipItem key={tip.rule} {...tip} />
          ))}
        </ul>
      </Card>
    </>
  )
}

function RoutineColumn({ title, icon, steps }: { title: string; icon: React.ReactNode; steps: { step: string; detail: string }[] }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </p>
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={`${s.step}-${i}`} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs">{i + 1}</span>
            <div>
              <p className="text-sm font-medium">{s.step}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function TimingCard({ timing }: { timing: AnalysisResult['timing_ms'] }) {
  const rows = [
    { label: 'Detect + align', value: timing.detect },
    { label: 'Model', value: timing.model },
    { label: 'Total', value: timing.total },
  ]
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Timer className="size-4" aria-hidden="true" />
        Inference timing
      </p>
      <dl className="flex flex-col gap-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-mono tabular-nums">{r.value} ms</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
