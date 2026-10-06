import type { Metadata } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { BenchmarkTable } from '@/components/benchmarks/benchmark-table'
import { FairnessTable } from '@/components/benchmarks/fairness-table'
import { LatencyChart } from '@/components/benchmarks/latency-chart'

export const metadata: Metadata = {
  title: 'Benchmarks — FaceSense',
  description: 'Accuracy, latency and fairness of the shared-backbone multi-task model versus single-task baselines.',
}

const SUMMARY = [
  { label: 'Model size', value: '14 MB', sub: 'vs 52 MB for 4 separate models' },
  { label: 'CPU latency', value: '118 ms', sub: 'one forward pass, target < 150 ms' },
  { label: 'Age MAE', value: '5.4 yrs', sub: 'UTKFace test split' },
  { label: 'Emotion acc.', value: '68.9%', sub: 'FER-2013, 7 classes' },
]

export default function BenchmarksPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader active="benchmarks" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:py-12">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-system-foreground">Evaluation</p>
          <h1 className="mt-2 text-pretty text-3xl font-semibold tracking-tight md:text-4xl">
            One backbone, four heads, measured honestly
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We compare the shared multi-task model against single-task baselines on accuracy, size and latency, and report
            results per demographic group.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((s) => (
            <li key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <BenchmarkTable />
          <LatencyChart />
        </div>
        <FairnessTable />
      </main>
      <SiteFooter />
    </div>
  )
}
