import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function Node({ title, sub, tone }: { title: string; sub: string; tone: 'user' | 'system' | 'output' }) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-center',
        tone === 'user' && 'border-foreground/25 bg-secondary',
        tone === 'system' && 'border-system-foreground/40 bg-system text-system-foreground',
        tone === 'output' && 'border-output-foreground/40 bg-output text-output-foreground',
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs opacity-80">{sub}</p>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex justify-center py-1.5 text-muted-foreground" aria-hidden="true">
      <ArrowDown className="size-4" />
    </div>
  )
}

export function PipelineDiagram() {
  return (
    <figure className="rounded-2xl border bg-card p-5 shadow-sm">
      <figcaption className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium">How inference works</span>
        <span className="font-mono text-xs text-muted-foreground">{'< 150 ms CPU'}</span>
      </figcaption>
      <Node title="Detect + align" sub="Crop, quality checks" tone="user" />
      <Arrow />
      <Node title="Shared backbone" sub="One forward pass · MobileNetV3" tone="system" />
      <Arrow />
      <div className="grid grid-cols-3 gap-2">
        <Node title="Age + gender" sub="Bins + binary" tone="output" />
        <Node title="Emotion" sub="7 classes" tone="output" />
        <Node title="Skin" sub="Acne, type, circles" tone="output" />
      </div>
      <Arrow />
      <Node title="Rules engine" sub="Wellness + skincare tips" tone="user" />
    </figure>
  )
}
